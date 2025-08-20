import { useEffect, useRef, useState } from "react";
import { ShieldCheck, ShieldEllipsis, ShieldX } from "lucide-react";
import * as styles from "@/styles/scss/AlarmPanel.module.scss";
import CustomModal from "./CustomModal";
import { formatRelativeTime } from "@/utils/helperfunctions";
import Badge from "../Badge";
import { Tooltip } from "@/components/ui/tooltip";

const severityColors: Record<string, { bg: string; color: string }> = {
    Critical: { bg: 'criticalAlarm', color: 'light' },
    Warning: { bg: 'warningAlarm', color: 'dark' },
    Information: { bg: 'infoAlarm', color: 'light' },
};

const AlarmCard = ({ removeacknowledgedAlarm, removeunacknowledgedAlarm, alarm, investigateAlarm, resolveAlarm, currentExpandedAckAlarm, setCurrentExpandedAckAlarm, currentExpandedUnackAlarm, setCurrentExpandedUnackAlarm, resolveInvestigatedAlarmData }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isResolveCommentModalOpen, setIsResolveCommentModalOpen] = useState(false);
    const [modalActionFunction, setModalActionFunction] = useState<any>(null);

    useEffect(() => {
        if(alarm.isAcknowledged){
            if (currentExpandedAckAlarm != "") {
                if (currentExpandedAckAlarm == alarm.id) {
                    setIsExpanded(true);
                    setIsResolveCommentModalOpen(false);
                }
                else {
                    setIsExpanded(false);
                    setIsResolveCommentModalOpen(false);
                }
            }
            else {
                setIsExpanded(false);
                setIsResolveCommentModalOpen(false);
            }
        }
        else if (currentExpandedUnackAlarm != "") {
            if (currentExpandedUnackAlarm == alarm.id) {
                setIsExpanded(true);
                setIsResolveCommentModalOpen(false);
            }
            else {
                setIsExpanded(false);
                setIsResolveCommentModalOpen(false);
            }
        }
        else {
            setIsExpanded(false);
            setIsResolveCommentModalOpen(false);
        }

    }, [currentExpandedAckAlarm, currentExpandedUnackAlarm]);

    const expandOrCollapseAlarm = () => {
        if (alarm.isAcknowledged) {
           currentExpandedAckAlarm == alarm.id ? setCurrentExpandedAckAlarm("") : setCurrentExpandedAckAlarm(alarm.id);
        }
        else {
            currentExpandedUnackAlarm == alarm.id ? setCurrentExpandedUnackAlarm("") : setCurrentExpandedUnackAlarm(alarm.id);
        }
    }

    const resolveInvestigatedAlarm = (alarmComment : string) => {
        resolveInvestigatedAlarmData(alarm.id, alarmComment)
    }

    const resolveUnacknowledgedAlarm = (alarmComment : string) => {
        resolveAlarm(alarm.id, alarmComment)
    }
    
    const ignoreInvestigatedAlarm = (alarmComment : string) => {
        removeacknowledgedAlarm(alarm.id, alarmComment);
    }

    const ignoreUnacknowledgedAlarm = (alarmComment : string) => {
        removeunacknowledgedAlarm(alarm.id, alarmComment);
    }


    return (
        <div className={`${styles.alarmCardContainer} ${isExpanded ? styles.expanded : ''} ${alarm.isAcknowledged && (alarm.alarmState == "Resolved" ? styles.resolvedAlarmCard : '')}`} onClick={() => { expandOrCollapseAlarm() }} >
            <CustomModal
                title={"Add comment"}
                isOpen={isResolveCommentModalOpen}
                actionFunction={modalActionFunction}
                setIsOpen={setIsResolveCommentModalOpen}
            />

            {alarm.isAcknowledged && (
                alarm.alarmState == "Investigating" ?
                    <Tooltip openDelay={100} closeDelay={150} content={<span className="p-2">{alarm.alarmComment}</span>}>
                        <ShieldEllipsis size={15} className={`${styles.ackAlarmStateIcon} ${styles.ackAlarmStateInvestigateIcon}`} />
                    </Tooltip>
                    :
                    alarm.alarmState == "Resolved" ?
                        <Tooltip openDelay={100} closeDelay={150} content={<span className="p-2">{alarm.alarmComment}</span>}>
                            <ShieldCheck size={15} className={`${styles.ackAlarmStateIcon} ${styles.ackAlarmStateResolveIcon}`} />
                        </Tooltip>
                        :
                        <Tooltip openDelay={100} closeDelay={150} content={<span className="p-2">{alarm.alarmComment}</span>}>
                            <ShieldX size={15} className={`${styles.ackAlarmStateIcon} ${styles.ackAlarmStateIgnoreIcon}`} />
                        </Tooltip>

            )}

            <div className={styles.alarmCardDiv}>
                <div>
                    <p className={styles.message}>{alarm.message}</p>
                    <span className={styles.time}>{formatRelativeTime(alarm.raisedAt)}</span>
                    {(alarm.isAcknowledged && (alarm.alarmState == "Resolved" || alarm.alarmState == "Ignored")) && <span className={styles.alarmComment}>{alarm.acknowledgedFrom}</span>}
                </div>
                <div className={styles.rightSide}>
                    <Badge
                        label={alarm.severity}
                        bgColor={severityColors[alarm.severity].bg}
                        textColor={severityColors[alarm.severity].color}
                    />
                </div>
            </div>

            {!alarm.isAcknowledged &&
                <div className={`${styles.expandedContent} ${isExpanded ? styles.show : ""}`}>
                    <Tooltip openDelay={100} closeDelay={150} content={<span>Mark as Investigating</span>}>
                    <button onClick={(event) => {
                            event.stopPropagation();
                            investigateAlarm(alarm.id);
                        }}
                        className={styles.ackBtn}
                    >
                        Investigate
                    </button>
                    </Tooltip>

                    <Tooltip openDelay={100} closeDelay={150} content={<span>Mark as Resolved</span>}>
                    <button
                        onClick={(event) => { event.stopPropagation(); setModalActionFunction(() => resolveUnacknowledgedAlarm); setIsResolveCommentModalOpen(true); }}
                        className={`${styles.ackBtn}`}
                    >
                        Resolve
                    </button>
                    </Tooltip>

                    <Tooltip openDelay={100} closeDelay={150} content={<span>Ignore Alarm</span>}>
                    <button
                        onClick={(event) => {event.stopPropagation(); setModalActionFunction(() => ignoreUnacknowledgedAlarm); setIsResolveCommentModalOpen(true);}}
                        className={`${styles.ackBtn}`}
                    >
                        Ignore
                    </button>
                    </Tooltip>
                </div>}

            {(alarm.isAcknowledged && alarm.alarmState == "Investigating") &&
                <div className={`${styles.expandedContent} ${isExpanded ? styles.show : ""}`}>
                    <Tooltip openDelay={100} closeDelay={150} content={<span>Mark as Resolved</span>}>
                    <button
                        onClick={(event) => { event.stopPropagation(); setModalActionFunction(() => resolveInvestigatedAlarm); setIsResolveCommentModalOpen(true); }}
                        className={`${styles.ackBtn}`}>
                        Resolve
                    </button>
                    </Tooltip>

                    <Tooltip openDelay={100} closeDelay={150} content={<span>Ignore Alarm</span>}>
                    <button
                        onClick={(event) => { event.stopPropagation(); setModalActionFunction(() => ignoreInvestigatedAlarm); setIsResolveCommentModalOpen(true);}}
                        className={`${styles.ackBtn}`}
                    >
                        Ignore
                    </button>
                    </Tooltip>
                </div>}
        </div>
    );
};

export default AlarmCard;
