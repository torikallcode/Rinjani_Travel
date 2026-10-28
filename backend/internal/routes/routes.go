package routes

import (
	"net/http"
	"time"

	"rinjani-travel-backend/internal/handlers"
	"rinjani-travel-backend/internal/middleware"
	"rinjani-travel-backend/internal/models"
	"rinjani-travel-backend/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB) {
	email := services.NewEmailService(db)
	authService := services.NewAuthService(db, email)
	authHandler := handlers.NewAuthHandler(authService)
	packageHandler := handlers.NewPackageHandler(db)
	departureHandler := handlers.NewDepartureHandler(db)
	bookingHandler := handlers.NewBookingHandler(db)
	paymentHandler := handlers.NewPaymentHandler(db, services.NewMockGateway())
	adminHandler := handlers.NewAdminHandler(db, authService)
	contentHandler := handlers.NewContentHandler(db)
	couponHandler := handlers.NewCouponHandler(db)
	reviewHandler := handlers.NewReviewHandler(db)
	contactHandler := handlers.NewContactHandler(db)

	api := router.Group("/api/v1")
	api.Use(middleware.DefaultRateLimit())

	api.GET("/health", func(c *gin.Context) {
		sqlDB, err := db.DB()
		status := "ok"
		if err != nil || sqlDB.Ping() != nil {
			status = "degraded"
		}
		c.JSON(http.StatusOK, gin.H{
			"status":  status,
			"message": "Rinjani Travel API is running",
			"time":    time.Now(),
		})
	})

	// Public catalog and content.
	api.GET("/packages", packageHandler.List)
	api.GET("/packages/:slug", packageHandler.Detail)
	api.GET("/departures/:id", packageHandler.Departure)
	api.GET("/reviews", reviewHandler.PublicList)
	api.GET("/content/:slug", contentHandler.Page)
	api.GET("/faqs", contentHandler.FAQs)
	api.GET("/settings/public", adminHandler.PublicSettings)
	api.POST("/contact", middleware.RateLimit(5, time.Minute), contactHandler.Create)
	api.POST("/coupons/:code/validate", couponHandler.Validate)

	// Authentication.
	auth := api.Group("/auth")
	{
		auth.POST("/register", middleware.StrictRateLimit(), authHandler.Register)
		auth.POST("/login", middleware.StrictRateLimit(), authHandler.Login)
		auth.POST("/verify-email", middleware.StrictRateLimit(), authHandler.VerifyEmail)
		auth.POST("/forgot-password", middleware.StrictRateLimit(), authHandler.ForgotPassword)
		auth.POST("/reset-password", middleware.StrictRateLimit(), authHandler.ResetPassword)
	}

	// Payment webhook (public, verified by signature).
	api.POST("/webhooks/payments/:provider", paymentHandler.Webhook)
	// Development-only mock payment simulation.
	api.POST("/dev/payments/:ref/pay", paymentHandler.Simulate)

	// Authenticated customer routes.
	customer := api.Group("")
	customer.Use(middleware.AuthMiddleware())
	{
		customer.GET("/me", authHandler.Me)
		customer.PUT("/me", authHandler.UpdateProfile)
		customer.PUT("/me/password", authHandler.ChangePassword)

		customer.POST("/bookings/quote", bookingHandler.Quote)
		customer.POST("/bookings", middleware.StrictRateLimit(), bookingHandler.Create)
		customer.GET("/bookings/:code", bookingHandler.MyBooking)
		customer.GET("/bookings/:code/voucher", bookingHandler.Voucher)
		customer.POST("/bookings/:code/cancel", bookingHandler.Cancel)
		customer.POST("/bookings/:code/reviews", bookingHandler.AddReview)
		customer.POST("/bookings/:code/payments", middleware.StrictRateLimit(), paymentHandler.Create)
		customer.GET("/bookings/:code/payments", paymentHandler.List)

		customer.GET("/me/bookings", bookingHandler.MyBookings)
		customer.GET("/me/bookings/:code", bookingHandler.MyBooking)
		customer.POST("/me/bookings/:code/cancel", bookingHandler.Cancel)
		customer.POST("/me/bookings/:code/reviews", bookingHandler.AddReview)
	}

	// Admin routes.
	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware())
	admin.Use(middleware.AdminMiddleware())
	{
		admin.GET("/dashboard", adminHandler.Dashboard)

		admin.GET("/packages", packageHandler.AdminList)
		admin.GET("/packages/:id", packageHandler.AdminGet)
		admin.POST("/packages", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminContent), packageHandler.Create)
		admin.PUT("/packages/:id", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminContent), packageHandler.Update)
		admin.DELETE("/packages/:id", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminContent), packageHandler.Delete)

		admin.GET("/departures", departureHandler.List)
		admin.POST("/departures", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminOps), departureHandler.Create)
		admin.PUT("/departures/:id", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminOps), departureHandler.Update)
		admin.DELETE("/departures/:id", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminOps), departureHandler.Delete)

		admin.GET("/bookings", bookingHandler.AdminList)
		admin.GET("/bookings/export", bookingHandler.AdminExport)
		admin.GET("/bookings/:code", bookingHandler.AdminGet)
		admin.PATCH("/bookings/:code/status", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminOps), bookingHandler.AdminUpdateStatus)
		admin.PATCH("/bookings/:code/notes", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminOps), bookingHandler.AdminUpdateNotes)
		admin.POST("/bookings/:code/resend", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminOps), bookingHandler.AdminResend)
		admin.POST("/bookings/:code/payments", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminOps), paymentHandler.AdminManual)

		admin.GET("/payments", paymentHandler.AdminList)
		admin.POST("/payments/:id/refund", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminOps), paymentHandler.Refund)
		admin.GET("/webhook-events", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminOps), paymentHandler.WebhookEvents)

		admin.GET("/customers", adminHandler.Customers)
		admin.GET("/customers/:id", adminHandler.CustomerDetail)

		admin.GET("/coupons", couponHandler.List)
		admin.POST("/coupons", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminContent), couponHandler.Create)
		admin.PUT("/coupons/:id", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminContent), couponHandler.Update)
		admin.DELETE("/coupons/:id", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminContent), couponHandler.Delete)

		admin.GET("/reviews", reviewHandler.AdminList)
		admin.PATCH("/reviews/:id", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminContent), reviewHandler.Moderate)

		admin.GET("/content", contentHandler.Pages)
		admin.POST("/content", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminContent), contentHandler.CreatePage)
		admin.PUT("/content/:id", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminContent), contentHandler.UpdatePage)
		admin.DELETE("/content/:id", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminContent), contentHandler.DeletePage)
		admin.GET("/faqs", contentHandler.FAQs)
		admin.POST("/faqs", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminContent), contentHandler.CreateFAQ)
		admin.PUT("/faqs/:id", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminContent), contentHandler.UpdateFAQ)
		admin.DELETE("/faqs/:id", middleware.RequireRoles(models.RoleSuperAdmin, models.RoleAdminContent), contentHandler.DeleteFAQ)

		admin.GET("/messages", contactHandler.List)
		admin.PATCH("/messages/:id", contactHandler.UpdateStatus)

		admin.GET("/staff", middleware.SuperAdminMiddleware(), adminHandler.Staff)
		admin.POST("/staff", middleware.SuperAdminMiddleware(), adminHandler.CreateStaff)
		admin.PUT("/staff/:id", middleware.SuperAdminMiddleware(), adminHandler.UpdateStaff)
		admin.GET("/audit-logs", middleware.SuperAdminMiddleware(), adminHandler.AuditLogs)
		admin.GET("/settings", middleware.SuperAdminMiddleware(), adminHandler.Settings)
		admin.PUT("/settings", middleware.SuperAdminMiddleware(), adminHandler.UpdateSettings)
	}
}
