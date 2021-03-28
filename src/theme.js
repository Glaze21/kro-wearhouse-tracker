import { createMuiTheme } from "@material-ui/core/styles";
const theme = createMuiTheme({
  palette: {
    primary: {
      light: "#484848",
      main: "#212121",
      dark: "#000000",
      contrastText: "#ffffff",
    },
    secondary: {
      light: "#cfcfcf",
      main: "#9e9e9e",
      dark: "#707070",
      contrastText: "#000000",
    },
  },
});
export default theme;
