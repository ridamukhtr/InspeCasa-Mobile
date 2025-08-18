import React, { useEffect, useRef, useState } from "react";
import { View, FlatList, StyleSheet, Image, NativeSyntheticEvent, NativeScrollEvent, TouchableOpacity } from "react-native";
import { hp, wp } from "../utilities/constants/constant.style";
import Colors from "../utilities/constants/colors";
import Video from "react-native-video";
import YoutubePlayer from "react-native-youtube-iframe";

interface SliderViewProps {
    images: string[];
    propertyImgStyle?: any;
    videoUrl?: string;
}

const SliderView = ({ images, propertyImgStyle, videoUrl }: SliderViewProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const intervalRef = useRef();
    const videoRef = useRef(null);

    const mediaItems = videoUrl ? [videoUrl, ...images] : [...images];

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const viewSize = event.nativeEvent.layoutMeasurement.width;
        const index = Math.floor(contentOffsetX / viewSize);
        setActiveIndex(index);
        setIsVideoPlaying(false);
    };

    const startSliderTimer = () => {
        if (mediaItems.length <= 1 || isVideoPlaying) return;

        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            const nextIndex = (activeIndex + 1) % mediaItems.length;
            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });
            setActiveIndex(nextIndex);
        }, 5000);
    };

    useEffect(() => {
        startSliderTimer();
        return () => clearInterval(intervalRef.current);
    }, [activeIndex, mediaItems.length, isVideoPlaying]);

    const isVideo = (url: string) => {
        return url?.includes('youtube.com') || url?.includes('youtu.be');
    };

    const isLocalVideo = (url: string) => {
        return url?.endsWith('.mp4') || url?.endsWith('.mov');
    };

    const extractYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleVideoPlay = (index: number) => {
        // Pause slider when video plays
        setIsVideoPlaying(true);
        clearInterval(intervalRef.current);
    };

    const handleVideoEnd = () => {
        // Resume slider when video ends
        setIsVideoPlaying(false);
        const nextIndex = (activeIndex + 1) % mediaItems.length;
        flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
        });
        setActiveIndex(nextIndex);
    };

    const handleVideoPress = () => {
        if (isVideoPlaying) {
            videoRef.current?.pause();
            setIsVideoPlaying(false);
        } else {
            videoRef.current?.play();
            setIsVideoPlaying(true);
        }
    };

    return (
        <View style={styles.container}>

            <FlatList
                ref={flatListRef}
                data={mediaItems.length > 0 ? mediaItems : [null]}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                getItemLayout={(data, index) => ({
                    length: wp,
                    offset: wp * index,
                    index,
                })}
                renderItem={({ item, index }) => (
                    <View style={styles.sliderItem}>
                        {item ? (
                            isVideo(item) ? (
                                <YoutubePlayer
                                    height={hp * 0.2}
                                    width={wp * 0.9}
                                    videoId={extractYouTubeId(item)}
                                    play={activeIndex === index && isVideoPlaying}
                                    onChangeState={(state) => {
                                        if (state === 'playing') handleVideoPlay(index);
                                        else if (state === 'ended') handleVideoEnd();
                                    }}
                                />
                            ) : isLocalVideo(item) ? (
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={handleVideoPress}
                                    style={styles.videoContainer}
                                >
                                    <Video
                                        ref={videoRef}
                                        source={{ uri: item }}
                                        style={[styles.propertyImage, propertyImgStyle]}
                                        paused={!isVideoPlaying || activeIndex !== index}
                                        resizeMode="cover"
                                        controls={false}
                                        onEnd={handleVideoEnd}
                                        onPlay={() => handleVideoPlay(index)}
                                    />

                                </TouchableOpacity>
                            ) : (
                                <Image
                                    source={{ uri: item }}
                                    style={[styles.propertyImage, propertyImgStyle]}
                                    resizeMode="cover"
                                />
                            )
                        ) : (
                            <Image
                                source={require("../assets/images/card_image_1.png")}
                                style={[styles.propertyImage, propertyImgStyle]}
                                resizeMode="cover"
                            />
                        )}
                    </View>
                )}
                keyExtractor={(_, index) => index.toString()}
            />
            {mediaItems?.length > 1 && (
                <View style={styles.indicatorContainer}>
                    {mediaItems?.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                activeIndex === index && styles.activeIndicator,
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        width: wp,
        alignItems: "center",
    },
    sliderItem: {
        width: wp,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 0,
    },
    propertyImage: {
        width: wp * 0.9,
        height: hp * 0.2,
        borderRadius: wp * 0.02,
        borderColor: Colors.dropGray,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    indicatorContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },
    indicator: {
        height: 3,
        width: 28,
        backgroundColor: Colors.dropGray,
        marginHorizontal: 5,
    },
    activeIndicator: {
        backgroundColor: Colors.primary,
    },
});

export default SliderView;

