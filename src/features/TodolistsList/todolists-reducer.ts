import {todolistsAPI, TodolistType} from "../../api/todolists-api"
import {Dispatch} from "redux"
import {
    AppActionsType,
    RequestStatusType,
    setAppErrorAC,
    setAppStatusAC,
    SetAppStatusActionType
} from "../../app/app-reducer";
import {ResultCode} from "./tasks-reducer";

const initialState: Array<TodolistDomainType> = []

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: TodolistsActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case "REMOVE-TODOLIST":
            return state.filter(tl => tl.id !== action.id)
        case "ADD-TODOLIST":
            return [{...action.todolist, filter: "all", entityStatus: "idle"}, ...state]
        case "CHANGE-TODOLIST-TITLE":
            return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
        case "CHANGE-TODOLIST-FILTER":
            return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
        case "CHANGE-TODOLIST-ENTITY-STATUS":
            return state.map(tl => tl.id === action.id ? {...tl, entityStatus: action.status} : tl)
        case "SET-TODOLISTS":
            return action.todolists.map(tl => ({...tl, filter: "all", entityStatus: "idle"}))
        default:
            return state
    }
}
// actions
export const removeTodolistAC = (id: string) => ({type: "REMOVE-TODOLIST", id} as const)
export const addTodolistAC = (todolist: TodolistType) => ({type: "ADD-TODOLIST", todolist} as const)
export const changeTodolistTitleAC = (id: string, title: string) => ({
    type: "CHANGE-TODOLIST-TITLE",
    id,
    title
} as const)
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({
    type: "CHANGE-TODOLIST-FILTER",
    id,
    filter
} as const)
export const changeTodolistEntityStatusAC = (id: string, status: RequestStatusType) => ({
    type: "CHANGE-TODOLIST-ENTITY-STATUS",
    id,
    status
} as const)
export const setTodolistsAC = (todolists: Array<TodolistType>) => ({type: "SET-TODOLISTS", todolists} as const)

// thunks
export const fetchTodolistsTC = () => {
    return (dispatch: Dispatch<TodolistsActionsType>) => {
        dispatch(setAppStatusAC("loading"))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTodolistsAC(res.data))
                dispatch(setAppStatusAC("succeeded"))
            })
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: Dispatch<TodolistsActionsType>) => {
        dispatch(setAppStatusAC("loading"))
        dispatch(changeTodolistEntityStatusAC(todolistId, "loading"))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                if (res.data.resultCode === ResultCode.success) {
                    dispatch(removeTodolistAC(todolistId))
                    dispatch(setAppStatusAC("succeeded"))
                } else {
                    if (res.data.messages.length) {
                        dispatch(setAppErrorAC(res.data.messages[0]))
                    } else {
                        dispatch(setAppErrorAC("Some error"))
                    }
                    dispatch(setAppStatusAC("failed"))
                    dispatch(changeTodolistEntityStatusAC(todolistId, "failed"))
                }
            })
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch<TodolistsActionsType>) => {
        dispatch(setAppStatusAC("loading"))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                if (res.data.resultCode === ResultCode.success) {
                    dispatch(addTodolistAC(res.data.data.item))
                    dispatch(setAppStatusAC("succeeded"))
                } else {
                    if (res.data.messages.length) {
                        dispatch(setAppErrorAC(res.data.messages[0]))
                    } else {
                        dispatch(setAppErrorAC("Some error"))
                    }
                    dispatch(setAppStatusAC("failed"))
                }
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch<TodolistsActionsType>) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodolistTitleAC(id, title))
            })
    }
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
export type ChangeTodolistEntityStatusActionType = ReturnType<typeof changeTodolistEntityStatusAC>;

type TodolistsActionsType =
    | RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>
    | SetTodolistsActionType
    | ChangeTodolistEntityStatusActionType
    // ?????? AppActionsType ?????????????????????????? ???? app-reducer.ts
    | AppActionsType

export type FilterValuesType = "all" | "active" | "completed";

export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
