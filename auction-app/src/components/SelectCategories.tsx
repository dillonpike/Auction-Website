import React from "react";
import Select from 'react-select'

interface ICategoriesProps {
    categories: Array<Category>
    setCategories: Function
}

const SelectCategories = (props: ICategoriesProps) => {

    const setCategories = (event: any) => {
        props.setCategories(event.target.value)
        return
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
                    onChange={setCategories}/>
        </div>
    )
}
export default SelectCategories;