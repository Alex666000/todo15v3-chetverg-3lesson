import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, {AlertProps} from "@mui/material/Alert";
import {useDispatch, useSelector} from "react-redux";
import {AppRootStateType} from "../../app/store";
import {setErrorAC} from "../../app/app-reducer";


const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

// переименовали снекбар на ErrorSnackbars
// тут используется лок стейт нам надо перделать на редакс - сначала меняются данные потом видим отрисовку
export function ErrorSnackbar() {
    // const [open, setOpen] = React.useState(false);
    const dispatch = useDispatch()
    const error = useSelector<AppRootStateType, string | null>(state => state.app.error)

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        // причина закрытия - кликнули мимо...или нажали на крестик
        if (reason === "clickaway") {
            return
        }
        // через 3 сек. ошибка исчезни - тоже исчезнет при нажатии на крестик
        dispatch(setErrorAC(null))
        // после нажатия на крестик устанавливаем false и снекбар скрывается
        // setOpen(false)
    }
    // при рендере - показывать или нет Snackbar теперь будем не на основе локального стейта
    // а глобального state


// есть ошибка = открыто будет окно
    const isOpen = error !== null

    return (
        /* тут показываем ошибку в Snackbar */
        <Snackbar open={isOpen} autoHideDuration={3000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="error" sx={{width: "100%"}}>
                {error}
            </Alert>
        </Snackbar>
    )
    // при нажатии на крестик не закрывается - как закрыть? Надо чтобы в глобальном стейте
    // error: 'Some error' - превратился в null
}

// Snackbar - тот алерт который всплывашкой выскакивает
// как правило всегда стейт контролируемый и видим что Snackbar контролируемый на вход передается open(видимый)
// autoHideDuration через 6 сек вызывает колбек на onClose - это handleClose
// если изначально не видим ошибку то меняем руками open на true
// удалим кнопку и handleClick так как мы будем показывать ошибку не по клику на нее
// classes удалим

// ОШИБКУ БУДЕМ ХРАНИТЬ В СТОРЕ РЕДАКСА ТАК КАК ОНА ГЛОБАЛЬНАЯ - если она придет сюда мы ее увидим и отобразим


/* ########################Алгоритм:###########################################
- из Материала компоненту ошибки берем и переименовываем и подключаем в Арр
- сначала меняем руками true а false, потом делаем редюсер всего Арр, подключаем его
- потом диспатчим и меняем без сервера от UI к BLL
- тесты пишем
- потом делаем появление ошибки в правильный момент: Когда может упасть ошибка?
когда например отправим сильно длинный title а сервак в "texarea" для таски (> 100 символов).
Валидация ошибки должна быть на сервере(бэкенд валидацию должен делать всегда!). Надо обработать ошибку
- которую сервер возвращает.Смотрим ответ с сервера если ввели очен длинное название и видим
что ошибка сетевого уровня а не серверная:
["The field Title must be a string or array type with a maximum length of '100'. (Title)"] -нам должен
был вернуться объект его нети ошибки на UI нет - надо ее показать
Идем туда где обрабатывается создание таски ищем санку addTaskTC - так как операция на сервер...

-- Далее делаем крутилку достанем в Арр статус и покажем  <LinearProgress /> если status === "loading" -
см Арр.tsx


перед тем как таски получать скажем см. fetchTasksTC: dispatch(setStatusAC("loading")) и после окончания запроса крутилку убери
dispatch(setStatusAC("succeeded")). Смотрим на UI и видим крутилка убралась

- Чтобы не нажать на кнопку удаления таски много-много раз - идет обработка конкретного тудулиста с конретным тудулистом что-то происходит
получается UX надо показать это - в сущность TodolistDomainType добавим status тудулиста - чтобы он со статусом Арр не
конфликтовал назовем его entityStatus - статус сущности конкретной b перезаюзаем тип status_a - RequestStatusType
теперь поймем что с сущностью тудулистом что-то происходит






 */






