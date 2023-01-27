
import React from "react";
import { View } from "react-native";
import { makeStyles } from "@rneui/themed";

export const Background: React.FC<{ children: any, style?: any }> = ({
    children,
    style
}) => {
    const styles = useStyles();
    return <View style={[styles.container, style]}>{children}</View>;
};

const useStyles = makeStyles((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
}));