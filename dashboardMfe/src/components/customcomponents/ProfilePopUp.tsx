import * as styles from "@/styles/scss/AlarmPanel.module.scss";
import { MessagesSquare, Settings2, SquareUser } from "lucide-react";

export const ProfilePopUp = () => {
  return (
    <div className={`${styles.profilePopOverSection} `}>
      <span className={`px-2 ${styles.profilePopUpTitle}`}>Welcome, Premal Kadam</span>
      <p className={`px-2 ${styles.profilePopUpSubTitle}`}>premal.kadam@wonderbiz.in</p>
      <div className={`px-2 py-2`}>
        <ul>
          <li className={styles.profileActionListLi}><SquareUser /> My Account</li>
          <li className={styles.profileActionListLi}><MessagesSquare /> Notifications</li>
          <li className={styles.profileActionListLi}><Settings2 /> Settings</li>
        </ul>
        <button onClick={(event: any) => { event.stopPropagation(); }} className={styles.logoutBtn}>Logout</button>
      </div>
    </div>
  );
}