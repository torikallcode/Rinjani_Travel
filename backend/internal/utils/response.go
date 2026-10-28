package utils

import (
	"github.com/gin-gonic/gin"
)

type ResponseMeta struct {
	Status  string `json:"status"`
	Message string `json:"message,omitempty"`
	Code    int    `json:"code"`
}

type Response struct {
	Meta ResponseMeta `json:"meta"`
	Data interface{}  `json:"data,omitempty"`
}

// SuccessResponse - Send success response
func SuccessResponse(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, Response{
		Meta: ResponseMeta{
			Status:  "success",
			Message: message,
			Code:    code,
		},
		Data: data,
	})
}

// ErrorResponse - Send error response
func ErrorResponse(c *gin.Context, code int, message string) {
	c.JSON(code, Response{
		Meta: ResponseMeta{
			Status:  "error",
			Message: message,
			Code:    code,
		},
	})
}

// PaginatedResponse - Send paginated response
type PaginatedData struct {
	Items      interface{} `json:"items"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalPages int         `json:"total_pages"`
}

func PaginatedResponse(c *gin.Context, code int, items interface{}, total int64, page int, pageSize int) {
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	c.JSON(code, Response{
		Meta: ResponseMeta{
			Status: "success",
			Code:   code,
		},
		Data: PaginatedData{
			Items:      items,
			Total:      total,
			Page:       page,
			PageSize:   pageSize,
			TotalPages: totalPages,
		},
	})
}
