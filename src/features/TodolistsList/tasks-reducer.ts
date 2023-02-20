import {AddTodolistActionType, RemoveTodolistActionType, SetTodolistsActionType} from "./todolists-reducer"
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from "../../api/todolists-api"
import {Dispatch} from "redux"
import {AppRootStateType} from "../../app/store"
import {setAppErrorAC, SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from "../../app/app-reducer";

export const tasksReducer = (state: TasksStateType = initialState, action: TasksActionsType): TasksStateType => {
    switch (action.type) {
        case "REMOVE-TASK":
            return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id !== action.taskId)}
        case "ADD-TASK":
            return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
        case "UPDATE-TASK":
            return {
                ...state,
                [action.todolistId]: state[action.todolistId]
                    .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
            }
        case "ADD-TODOLIST":
            return {...state, [action.todolist.id]: []}
        case "REMOVE-TODOLIST":
            const copyState = {...state}
            delete copyState[action.id]
            return copyState
        case "SET-TODOLISTS": {
            const copyState = {...state}
            action.todolists.forEach(tl => {
                copyState[tl.id] = []
            })
            return copyState
        }
        case "SET-TASKS":
            return {...state, [action.todolistId]: action.tasks}
        default:
            return state
    }
}

// actions
export const removeTaskAC = (taskId: string, todolistId: string) =>
    ({type: "REMOVE-TASK", taskId, todolistId} as const)
export const addTaskAC = (task: TaskType) =>
    ({type: "ADD-TASK", task} as const)
export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
    ({type: "UPDATE-TASK", model, todolistId, taskId} as const)
export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
    ({type: "SET-TASKS", tasks, todolistId} as const)

// thunks
export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch<TasksActionsType | SetAppStatusActionType>) => {
    // перед запросом крутилку покажи
    dispatch(setAppStatusAC("loading"))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            const action = setTasksAC(tasks, todolistId)
            dispatch(action)
            // после оканчания убери крутилку
            dispatch(setAppStatusAC("succeeded"))
        })
}
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch<TasksActionsType>) => {
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(res => {
            const action = removeTaskAC(taskId, todolistId)
            dispatch(action)
        })
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch<TasksActionsType | SetAppErrorActionType | SetAppStatusActionType>) => {
    dispatch(setAppStatusAC("loading"))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            // логика чтобы увидеть ошибку на UI если она есть feedback...:
            // анализ ответа и ошибки со строки 71 ErrorSnackbar.ts
            if (res.data.resultCode === 0) {
                const task = res.data.data.item
                const action = addTaskAC(task)
                dispatch(action)
                dispatch(setAppStatusAC("succeeded"))
            } else {
                // перепроверяем - перестраховка доп if
                //  if error here then dispatn action with Error
                if (res.data.messages.length) {
                    // подчеркнулась ошибка - т.к можем диспатчить экшены которые наших же санок и касаются
                    // а тут диспатчим экшен который пришел из др редюсера
                    // добавим его тип в санку (dispatch: Dispatch<TasksActionsType | SetErrorActionType>)

                    // или так короче написать чтобы в else не писать на строке 95
                    // dispatch(setErrorAC(res.data.messages.length ? setErrorAC(res.data.messages[0]) : "Some error occurred"))

                    // если с сервера ошибка не пришла то
                } else {
                    dispatch(setAppErrorAC("Some error occurred"))
                }
                dispatch(setAppStatusAC("failed"))
            }
        })
        .catch((error) => {
            // так смотрим структуру и проверяем ошибки
            // debugger
            // console.log(error)
            // пользователю не всегда надо знать низкоуровневые названия от сервера ошибки = сложное название для пользователя
            // но пока пусть будет но лучше текст написать: "Обратись к администратору например или Включи интернет..."

            // увидим ошибку нашу UX
            dispatch(setAppErrorAC(error.message))
            // убираем крутилку чтобы не крутилась так как запрос не идет больше...
            dispatch(setAppStatusAC("failed"))
        })
}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch<ThunkDispatch | any>, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn("task not found in the state")
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }

        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                if (res.data.resultCode === 0) {
                    const action = updateTaskAC(taskId, domainModel, todolistId)
                    dispatch(action)
                } else {
                    if (res.data.messages.length) {
                    } else {
                        dispatch(setAppErrorAC("Some error occurred"))
                    }
                    dispatch(setAppStatusAC("failed"))
                }
            })
            .catch((error) => {
                dispatch(setAppErrorAC(error.message))
                dispatch(setAppStatusAC("failed"))
            })
    }

// types
const initialState: TasksStateType = {}

export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
type TasksActionsType =
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof updateTaskAC>
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodolistsActionType
    | ReturnType<typeof setTasksAC>

type ThunkDispatch = Dispatch<TasksActionsType> | SetAppStatusActionType | SetAppErrorActionType
/*
UX обработка ошибок:
сначала сделаем добавление таски
потом обновление таски - введем очень длинный title - если есть резалткод его всегда анализируем

 */