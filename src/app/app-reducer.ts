/*
Мы могли бы написать isLoading со значением фалс или тру...но написали status
– так всегда делать это универсальный способ -булеан значения указывать плохо, так как оно не расширяемо, у нас либо да или нет все! А когда есть такие типы может добавить
что то дополнительно наше приложение легко и удобно расширяемо в библиотеках материал и тд такой же подход
 */

const initialState = {
    status: "loading" as RequestStatusType,
    error: null as string | null,
    // error: ("Some error" || null) as string | null
}

export const appReducer = (state: InitialStateType = initialState, action: AppActionsType): InitialStateType => {
    switch (action.type) {
        // нейминг redux ducks
        case "APP/SET-STATUS":
            return {...state, status: action.status}
        case "APP/SET-ERROR":
            return {...state, error: action.error}
        default:
            return state
    }
}
// actions
export const setAppErrorAC = (error: string | null ) => ({type: "APP/SET-ERROR", error} as const)
export const setAppStatusAC = (status: RequestStatusType) => ({type: "APP/SET-STATUS", status} as const)


// types
export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed"

type InitialStateType = typeof initialState

export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>

export type AppActionsType = SetAppErrorActionType | SetAppStatusActionType
