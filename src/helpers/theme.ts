import { createTheme, darkColors } from '@rneui/themed';

export const theme = createTheme({
    mode: 'dark',
    darkColors: {
        background: '#17181f',
        primary: '#4f6cdd',
    },
    components: {
        Button: {
            containerStyle: {
                borderRadius: 30,
            }
        },
        ListItemSubtitle: {
            style: {
                color: darkColors.grey3
            }
        }
    }
});