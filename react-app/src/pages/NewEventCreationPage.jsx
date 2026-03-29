import { NavigationBar } from "../components/NavigationBar";
import { SideBar } from "../components/SideBar";
import { SearchBar } from "../components/SearchBar";
import EventCreationForm from "../components/EventCreationForm";

export const NewEventCreationPage = () => {
  return (
    <>
      <NavigationBar />
      <SearchBar />
      <SideBar />
      <EventCreationForm />
    </>
  );
};
