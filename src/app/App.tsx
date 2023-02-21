import React from "react"
import "./App.css"
import {TodolistsList} from "../features/TodolistsList/TodolistsList"
// You can learn about the difference by reading this guide on minimizing bundle size.
// https://mui.com/guides/minimiz   ing-bundle-size/
// import { AppBar, Button, Container, IconButton, Toolbar, Typography } from '@mui/material';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import {Menu} from "@mui/icons-material";
import LinearProgress from "@mui/material/LinearProgress";
import ErrorSnackbar from "../components/ErrorSnackbar/ErrorSnackbar";
import {useSelector} from "react-redux";
import {AppRootStateType} from "./store";
import {RequestStatusType} from "./app-reducer";

type PropsType = {
    demo?: boolean
}

function App({demo = false}: PropsType) {

    const status = useSelector<AppRootStateType, RequestStatusType>(state => state.app.status)

    return (
        <div className="App">
            <AppBar position="static">
                <ErrorSnackbar/>
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu">
                        <Menu/>
                    </IconButton>
                    <Typography variant="h6">
                        News
                    </Typography>
                    <Button color="inherit">Login</Button>
                </Toolbar>
                {/*UI делаем зависимым от state - сначала данные потом отрисовка*/}
                {status === "loading" && <LinearProgress/>}
            </AppBar>
            <Container fixed>
                <TodolistsList demo={demo}/>
            </Container>
        </div>
    )
}

export default App
/*

все ActionsType - НЕ - храним в store как Димыч!!!

пишем Арр  case "APP/SET-STATUS": так как если второй разраб пишет фичу в др редюсере имена кейсов могут
совпадать с моими поэтому каждый на проекте пишет перед название редюсера

@mui/material - вбиваем в MUI и смотрим размер и размер каждой компоненты отдельно поиском чтобы выбрать какую с минимальным весом использовать
редюсеров сколько и сущностей - сущность штука у которой есть CRUD операции + 2 дополнительных редюсера:
app-reducer и auth-reducer для авторизации
чтобы крутилку не засовывать в каждый редюсер ее зосовываем в арр-reducer

*/

/*
при выборе любой библиотеки в поиске библы вбиваем tree shaking и проверяем размер и встряхивается ли она = уменьшается?

Вы можете использовать импорт путей, чтобы избежать загрузки неиспользуемых модулей. Например, используйте:

// 🚀 Fast
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

вместо импорта верхнего уровня (без плагина Babel):

import { Button, TextField } from '@mui/material';

лучше использовать в MUI дефолтные импорты

но бывают ситуации когда крутилку делают локально для конкретной сущности и в redux будет лишним это делать

 */
