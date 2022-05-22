import SearchBar from "./SearchBar";
import React from "react";
import axios from "axios";
import SelectFilter from "./SelectFilter";

const Home = () => {

    const [categories, setCategories] = React.useState<Array<Category>>([])
    React.useEffect(() => {
        const getCategory = () => {
            axios.get('http://localhost:4941/api/v1/auctions/categories')
                .then((response) => {
                    setCategories(response.data)
                })
        }
        getCategory()
    }, [setCategories])

    return (
        <div>
            <SearchBar/>
            <SelectFilter categories={categories}/>
        </div>
    )
}
export default Home;