import { View, StyleSheet } from "react-native";
import CustomText from "./CustomText";
import globalStyles from "../utilities/constants/globalStyles";

interface BulletItem {
    label?: string;
    text: string;
    append?: string;
    isLink?: boolean;
}

interface SectionProps {
    title: string;
    bullets: BulletItem[];
}

const Section: React.FC<SectionProps> = ({ title, bullets }) => (
    <View style={styles.section}>
        <CustomText style={globalStyles.statusText}>{title}</CustomText>
        {bullets.map((item, index) => (
            <CustomText key={index} style={styles.bullet}>
                {'\u2022'}{' '}
                {item.label && <CustomText style={styles.bold}>{item.label} </CustomText>}
                <CustomText>
                    {item.text}
                    {item.append && (
                        <CustomText style={item.isLink ? styles.link : undefined}>
                            {item.append}
                        </CustomText>
                    )}
                </CustomText>
            </CustomText>
        ))}
    </View>
);

const styles = StyleSheet.create({
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    bullet: {
        fontSize: 14,
        marginLeft: 10,
        marginBottom: 6,
        lineHeight: 20,
    },
    bold: {
        fontWeight: 'bold',
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
})


export default Section