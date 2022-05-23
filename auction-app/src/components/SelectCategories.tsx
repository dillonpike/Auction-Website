import React from "react";
import Select from 'react-select'

interface ICategoriesProps {
    categories: Array<Category>
    setCategories: Function
}

const SelectCategories = (props: ICategoriesProps) => {

    const updateCategories = (options: any) => {
        props.setCategories(options.map((c: any) => {
            return {categoryId: c.value, name: c.label}
        }))
        return options
    }

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
            <Select isMulti className="basic-multi-select" options={options} placeholder="Categories"
                    onChange={updateCategories}/>
        </div>
    )
}
export default SelectCategories;