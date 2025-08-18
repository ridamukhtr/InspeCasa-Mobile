import React, { useEffect, useState } from "react";
import {
    Modal,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Colors from "../utilities/constants/colors";
import { ArrowLeft, ArrowRight } from "../assets/icons";
import { Typography, wp } from "../utilities/constants/constant.style";

type CustomCalendarProps = {
    visible: boolean;
    onClose: () => void;
    onSelectDates: (dates: { from: string; to: string }) => void;
    initialFromDate?: string | null;
    initialToDate?: string | null;
};

const CustomCalendar = ({
    visible,
    onClose,
    onSelectDates,
    initialFromDate = null,
    initialToDate = null,
}: CustomCalendarProps) => {
    const [displayedMonth, setDisplayedMonth] = useState(new Date());
    const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
    const [startDate, setStartDate] = useState<string | null>(initialFromDate);
    const [endDate, setEndDate] = useState<string | null>(initialToDate);

    useEffect(() => {
        if (initialFromDate && initialToDate) {
            // Pre-mark dates if coming from parent
            const newMarkedDates: Record<string, any> = {};
            const start = new Date(initialFromDate);
            const end = new Date(initialToDate);
            let current = new Date(start);

            while (current <= end) {
                const dateStr = current.toISOString().split("T")[0];
                if (dateStr === initialFromDate) {
                    newMarkedDates[dateStr] = {
                        startingDay: true,
                        color: Colors.primary,
                        textColor: Colors.light,
                    };
                } else if (dateStr === initialToDate) {
                    newMarkedDates[dateStr] = {
                        endingDay: true,
                        color: Colors.primary,
                        textColor: Colors.light,
                    };
                } else {
                    newMarkedDates[dateStr] = {
                        color: "#b0dfdc",
                        textColor: Colors.black,
                    };
                }
                current.setDate(current.getDate() + 1);
            }
            setMarkedDates(newMarkedDates);
        }
    }, [initialFromDate, initialToDate]);

    const handlePrevMonth = () => {
        const newMonth = new Date(displayedMonth);
        newMonth.setMonth(newMonth.getMonth() - 1);
        setDisplayedMonth(newMonth);
    };

    const handleNextMonth = () => {
        const newMonth = new Date(displayedMonth);
        newMonth.setMonth(newMonth.getMonth() + 1);
        setDisplayedMonth(newMonth);
    };

    const formatMonth = (date: Date) => {
        return date.toLocaleString("default", { month: "long" });
    };

    const onDayPress = (day: { dateString: string }) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(day.dateString);
            setEndDate(null);
            setMarkedDates({
                [day.dateString]: {
                    startingDay: true,
                    endingDay: true,
                    color: Colors.primary,
                    textColor: Colors.light,
                },
            });
        } else {
            const start = new Date(startDate);
            const end = new Date(day.dateString);

            if (end < start) {
                setStartDate(day.dateString);
                setEndDate(null);
                setMarkedDates({
                    [day.dateString]: {
                        startingDay: true,
                        endingDay: true,
                        color: Colors.primary,
                        textColor: Colors.light,
                    },
                });
                return;
            }

            const newMarkedDates: Record<string, any> = {};
            let current = new Date(start);

            while (current <= end) {
                const dateStr = current.toISOString().split("T")[0];
                if (dateStr === startDate && dateStr === day.dateString) {
                    // Single day selection
                    newMarkedDates[dateStr] = {
                        startingDay: true,
                        endingDay: true,
                        color: Colors.primary,
                        textColor: Colors.light,
                    };
                } else if (dateStr === startDate) {
                    newMarkedDates[dateStr] = {
                        startingDay: true,
                        color: Colors.primary,
                        textColor: Colors.light,
                    };
                } else if (dateStr === day.dateString) {
                    newMarkedDates[dateStr] = {
                        endingDay: true,
                        color: Colors.primary,
                        textColor: Colors.light,
                    };
                } else {
                    newMarkedDates[dateStr] = {
                        color: "#b0dfdc",
                        textColor: Colors.black,
                    };
                }

                current.setDate(current.getDate() + 1);
            }

            setEndDate(day.dateString);
            setMarkedDates(newMarkedDates);
            onSelectDates({ from: startDate, to: day.dateString });
            setTimeout(() => {
                onClose();
            }, 800);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View style={styles.calendarModal}>
                            <Calendar
                                key={displayedMonth.toISOString()}
                                hideExtraDays
                                markingType="period"
                                markedDates={markedDates}
                                onDayPress={onDayPress}
                                hideArrows
                                current={displayedMonth.toISOString().split("T")[0]}
                                theme={{
                                    todayTextColor: Colors.primary,
                                    dayTextColor: Colors.black,
                                    textDayFontFamily: "Nunito-Medium",
                                    textDayFontSize: 14,
                                    textDayHeaderFontFamily: "Nunito-Medium",
                                }}
                                renderHeader={() => (
                                    <View style={styles.calendarHeader}>
                                        <TouchableOpacity style={styles.arrowButton} onPress={handlePrevMonth}>
                                            <ArrowLeft />
                                        </TouchableOpacity>
                                        <Text style={styles.headerMonthText}>
                                            {formatMonth(displayedMonth)}
                                        </Text>
                                        <TouchableOpacity style={styles.arrowButton} onPress={handleNextMonth}>
                                            <ArrowRight />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback >
        </Modal >
    );
};

export default CustomCalendar;


const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: "center",
        alignItems: "center",
    },
    calendarModal: {
        width: wp * 0.9,
        backgroundColor: Colors.light,
        padding: 5,
        borderRadius: wp * 0.04,
        elevation: 2,
    },
    calendarHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 25,
        borderWidth: 1,
        borderColor: Colors.grayLight,
        padding: 13,
        borderRadius: 8,
    },
    headerMonthText: {
        ...Typography.f_14_nunito_medium,
        color: Colors.black,
    },
    arrowButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#00808066",
        justifyContent: 'center',
        alignItems: 'center',
    },
});
