import { NavigationBar } from '../components/NavigationBar';
import { SideBar } from '../components/SideBar';
import { SearchBar } from "../components/SearchBar";

export const AdministrationDashboard = () => {
    return(
        <>
            <NavigationBar/>
            <SearchBar/>
            <SideBar/>
        </>
    );
}