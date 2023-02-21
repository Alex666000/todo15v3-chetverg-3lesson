import React, {useCallback, useEffect} from "react"
import {AddItemForm} from "../../../components/AddItemForm/AddItemForm"
import {EditableSpan} from "../../../components/EditableSpan/EditableSpan"
import {Task} from "./Task/Task"
import {TaskStatuses, TaskType} from "../../../api/todolists-api"
import {FilterValuesType, TodolistDomainType} from "../todolists-reducer"
import {fetchTasksTC} from "../tasks-reducer"
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import {Delete} from "@mui/icons-material";
import {useAppDispatch} from "../../../app/store";
import {RequestStatusType} from "../../../app/app-reducer";

type PropsType = {
    todolist: TodolistDomainType
    // id: string
    // title: string
// filter: FilterValuesType
    // entityStatus: RequestStatusType
    tasks: Array<TaskType>
    changeFilter: (value: FilterValuesType, todolistId: string) => void
    addTask: (title: string, todolistId: string) => void
    changeTaskStatus: (id: string, status: TaskStatuses, todolistId: string) => void
    changeTaskTitle: (taskId: string, newTitle: string, todolistId: string) => void
    removeTask: (taskId: string, todolistId: string) => void
    removeTodolist: (id: string) => void
    changeTodolistTitle: (id: string, newTitle: string) => void
    demo?: boolean
    // entityStatus?: RequestStatusType
}

export const Todolist = React.memo(function ({demo = false, ...props}: PropsType) {
    console.log("Todolist called")

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (demo) {
            return
        }
        const thunk = fetchTasksTC(props.todolist.id)
        dispatch(thunk)
    }, [])

    const addTask = useCallback((title: string) => {
        props.addTask(title, props.todolist.id)
    }, [props.addTask, props.todolist.id])

    const removeTodolist = () => {
        props.removeTodolist(props.todolist.id)
    }
    const changeTodolistTitle = useCallback((title: string) => {
        props.changeTodolistTitle(props.todolist.id, title)
    }, [props.todolist.id, props.changeTodolistTitle])

    const onAllClickHandler = useCallback(() => props.changeFilter("all", props.todolist.id), [props.todolist.id, props.changeFilter])
    const onActiveClickHandler = useCallback(() => props.changeFilter("active", props.todolist.id), [props.todolist.id, props.changeFilter])
    const onCompletedClickHandler = useCallback(() => props.changeFilter("completed", props.todolist.id), [props.todolist.id, props.changeFilter])


    let tasksForTodolist = props.tasks

    if (props.todolist.filter === "active") {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.New)
    }
    if (props.todolist.filter === "completed") {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.Completed)
    }

    return <div>
        <h3><EditableSpan value={props.todolist.title} onChange={changeTodolistTitle}/>
            <IconButton onClick={removeTodolist} disabled={props.todolist.entityStatus === "loading"}>
                <Delete/>
            </IconButton>
        </h3>
        <AddItemForm addItem={addTask} disabled={props.todolist.entityStatus === "loading"}/>
        {/*disabled={props.entityStatus === 'loading'}*/}
        <div>
            {
                tasksForTodolist.map(t => <Task key={t.id} task={t} todolistId={props.todolist.id}
                                                removeTask={props.removeTask}
                                                changeTaskTitle={props.changeTaskTitle}
                                                changeTaskStatus={props.changeTaskStatus}
                />)
            }
        </div>
        <div style={{paddingTop: "10px"}}>
            <Button variant={props.todolist.filter === "all" ? "outlined" : "text"}
                    onClick={onAllClickHandler}
                    color={"inherit"}
            >All
            </Button>
            <Button variant={props.todolist.filter === "active" ? "outlined" : "text"}
                    onClick={onActiveClickHandler}
                    color={"primary"}>
                Active
            </Button>
            <Button variant={props.todolist.filter === "completed" ? "outlined" : "text"}
                    onClick={onCompletedClickHandler}
                    color={"secondary"}>
                Completed
            </Button>
        </div>
    </div>
})

/*
чтобы тудулист Не загружал с сервера свои таски нам надо демо режим ему в пропсах передать - для сторибука надо чтобы
он не подгружал их с сервера типа "моковые" данные
demo - туду не с сервака а которые у нас в тестовом состоянии сторибука...
так как у тдулиста очень много пропсов - и когда его надо отрисовать еще появятся доп свойства
что у нас в типе сидят TodolistType - скажем что он принимает todolist весь целиком - todolist: TodolistDomainType
удадим лишние из пропсов свойства id title filter(их много передавать не надо...проще весь объект)
теперь нет смысла отдельно принимать эти свойства - передадим все эти же данные в виде упакованного объекта todolist

- если у todolist status === 'loading' значит с ним что-то происходит - я не знаю что - но кнопка пусть будет задизейблена
пользователь должен получать обратную связь <IconButton onClick={removeTodolist} disabled={props.todolist.entityStatus === 'loading'}>

- теперь не дадим возможность добавлять таску если с тудулистом что-то происходит - задизейблим addItemForm
его статус - добавим ему disabled и теперь когда у нас тудулист задизейблен он должен передать свой статус true addItemForm - полю добавления таски
<AddItemForm addItem={addTask} disabled={props.todolist.entityStatus === 'loading'}/>
- аналогично не нужно уметь переходить в режим редактирования если мы сейчас задизейблены (таски при клике на чекбокс тоже аналогично можно сделать)
- теперь надо уметь менять эти состояния не руками - делается в санке так как запрос на сервер есть!!!
когда запрос на сервер сущности пошел - ставим статус === loading как делалии в арр, идем в todolistsReducer И ДОБАВЛЯЕМ ВСЮ ЛОГИКУ ЭКШН, РЕДЮСЕР
для изменения статуса:
        case "CHANGE-TODOLIST-ENTITY-STATUS":
            return state.map(tl => tl.id === action.id ? {...tl, entityStatus: action.status} : tl)
далее идем в санку где тудулист удаляется removeTodolistTC и пишем логику где диспатчим статус сущности на сервер

- идём на UI удаляем тудулист и видим замирание и дизебл и туду удаляется UX успешно готов

Вывод: сущность UX ее делаем чтобы не блокировать все приложение дизейблом чтобы дать в момент удаления к примеру сущности
пользователю работать с приложением дальше
*/


