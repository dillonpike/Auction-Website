import React from "react";
import Select from 'react-select'

interface ICategoriesProps {
    categories: Array<Category>
}

const SelectFilter = (props: ICategoriesProps) => {

    const options = [
        {
            label: "Categories",
            value: 0,
            options: props.categories.map((category: Category) => {
                return {value: category.categoryId, label: category.name}
            })
        }
    ]

    return (
        <div>
            <Select isMulti className="basic-multi-select" options={options} placeholder="Categories"/>
        </div>
    )
}
export default SelectFilter;