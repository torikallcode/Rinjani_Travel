import React from 'react';

const CategoryList = ({ categories, onSelectCategory }) => {
  return (
    <div className="category-list">
      <h2 className='text-white'>Categories</h2>
      <ul className='text-white'>
        {categories.map((category, index) => (
          <li key={index} onClick={() => onSelectCategory(category)}>
            {category}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;
