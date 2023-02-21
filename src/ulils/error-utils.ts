import {setAppErrorAC, SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from "../app/app-reducer";
import {ResponseType} from "../api/todolists-api";
import {Dispatch} from "redux";

export function handleServerAppError<D>(data: ResponseType<D>, dispatch: Dispatch<SetAppErrorActionType | SetAppStatusActionType>) {
    if (data.messages.length) {
    } else {
        dispatch(setAppErrorAC("Some error occurred"))
    }
    dispatch(setAppStatusAC("failed"))
}
// можно передать не весь объект а только message - message: string
export function handleServerNetworkError<D>(error: { message: string }, dispatch: Dispatch<SetAppErrorActionType | SetAppStatusActionType>) {
    dispatch(setAppErrorAC(error ? error.message : 'Some error occurred'))
    dispatch(setAppStatusAC("failed"))
}
// если ResponseType конфликтует то это тип из библиотеки - надо вручную проимпортировать
// ошибка - не видит messages в res но у res нет messages - сообщение у data - значит data сюда должны передат
// пишем при вызове функции handleServerAppError(res.data,dispatch) - ставим сигнатур при ошибки на параметр и при определении функции он доставит параметр и типизацию почти до конца
// Dispatch - дистпатч всегда уточняется actionsTypes
// так как сделали error: any - то в нем может сидеть undefined надо проверить
// далее вставляем функции в тот catch сверху где дублируется также
// заменим  error: any на error: { message: string }
// идет в обновление таски и проверяем - для этого отключим network
// расставляем вспомогательные функции и вставить в др таски

/*
                                  ОТ ВАЛЕРЫ РЕЗУЛЬТАТ:
AnyAction если в ошибке TS есть - означает любой экшн, надо прописать не любой а конкретный - тогда ошибка пропадет

export const handleNetworkError = (dispatch: Dispatch<AppActionsType>, message: string) => {
    dispatch(setAppErrorAC(message))
    dispatch(setAppStatusAC('failed'))
}
// data - это  res.data
export const handleAppError = <T>(dispatch: Dispatch<AppActionsType>, data: ResponseType<T>) => {
    if (data.messages.length) {
        dispatch(setAppErrorAC(data.messages[0]))
    } else {
        dispatch(setAppErrorAC("Some error"))
    }
    dispatch(setAppStatusAC("failed"))
}
/*

Как избавится от data: any в параметрах (dispatch: Dispatch<AppActionsType>, data: any)
будем анализировать что такое data какой ее тип идем в тудулист редюсер и смотрим какие данные там приходят - они
берутся из апи: data для tasks и todolists разная
- теперь вопрос как этот <T> принять? Спереди --- Дженериковая функция...

 */


 */
