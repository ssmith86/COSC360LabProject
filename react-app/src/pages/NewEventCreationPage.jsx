import { NavigationBar } from '../components/NavigationBar';
import { SideBar } from '../components/SideBar';
import { SearchBar } from "../components/SearchBar";

export const NewEventCreationPage = () => {
    return(
        <>
            <NavigationBar/>
            <SearchBar/>
            <SideBar/>
        </>
    );
}