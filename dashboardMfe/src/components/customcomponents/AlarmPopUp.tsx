import * as styles from "@/styles/scss/AlarmPanel.module.scss";
import { formatRelativeTime } from "@/utils/helperfunctions";

export const AlarmPopUp = ({ setIsAlarmPanelOpen, latestAlarms, totalAlarms }: any) => {
  const severityColors: Record<string, { bg: string; color: string }> = {
    Critical: { bg: 'criticalAlarm', color: 'light' },
    Warning: { bg: 'warningAlarm', color: 'dark' },
    Information: { bg: 'infoAlarm', color: 'light' },
  };

  return (
    <div className={`${styles.alarmPopOverSection} `}>
      {latestAlarms.map((alarm: any) => {
        return (
          <div className={`${styles.alarmPopUpAlarmCard}`} key={alarm.id}>
            <span className={`${styles.severityDot} ${styles[`severityDotBg--${severityColors[alarm.severity].bg}`]}`} />
            <div>
              <p className={styles.message}>{alarm.message}</p>
              <span className={styles.time}>{formatRelativeTime(alarm.raisedAt)}</span>
            </div>
          </div>
        );
      })}
      <button onClick={(event: any) => { event.stopPropagation(); setIsAlarmPanelOpen(true) }} className={styles.viewBtn}>View all</button>
    </div>
  );
}
