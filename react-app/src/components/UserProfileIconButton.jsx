import { MdAccountCircle, MdKeyboardArrowDown } from "react-icons/md";
import "./css files/UserProfileIconButton.css";

export default function UserProfileIconButton(){
    return(
        <button className="profile-menu" type="button">
            <MdAccountCircle className="profile-icon" />
            <MdKeyboardArrowDown className="chevron-icon" />
        </button>
    );
}