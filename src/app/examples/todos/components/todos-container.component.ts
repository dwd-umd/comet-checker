import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ROUTE_ANIMATIONS_ELEMENTS, NotificationService } from '@app/core';

import { ActionTodosAdd, ActionTodosFilter, ActionTodosRemoveDone, ActionTodosToggle } from '../todos.actions';
import { selectTodos, selectRemoveDoneTodosDisabled } from '../todos.selectors';
import { ITodo, TodosFilter } from '../todos.model';
import { IState } from '../../examples.state';

@Component({
  selector: 'cccc-todos',
  templateUrl: './todos-container.component.html',
  styleUrls: ['./todos-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodosContainerComponent implements OnInit {
  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
  todos$: Observable<ITodo[]>;
  removeDoneDisabled$: Observable<boolean>;
  newTodo = '';

  constructor(
    //
    public store: Store<IState>,
    public snackBar: MatSnackBar,
    public translateService: TranslateService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.todos$ = this.store.pipe(select(selectTodos));
    this.removeDoneDisabled$ = this.store.pipe(select(selectRemoveDoneTodosDisabled));
  }

  get isAddTodoDisabled() {
    return this.newTodo.length < 4;
  }

  onNewTodoChange(newTodo: string) {
    this.newTodo = newTodo;
  }

  onNewTodoClear() {
    this.newTodo = '';
  }

  onAddTodo() {
    this.store.dispatch(new ActionTodosAdd({ name: this.newTodo }));
    const addedMessage = this.translateService.instant('cccc.examples.todos.added.notification', { name: this.newTodo });
    this.notificationService.info(addedMessage);
    this.newTodo = '';
  }

  onToggleTodo(todo: ITodo) {
    this.store.dispatch(new ActionTodosToggle({ id: todo.id }));
    const newStatus = this.translateService.instant(`cccc.examples.todos.filter.${todo.done ? 'active' : 'done'}`);
    const undo = this.translateService.instant('cccc.examples.todos.undo');
    const toggledMessage = this.translateService.instant('cccc.examples.todos.toggle.notification', { name: todo.name });

    this.snackBar
      .open(`${toggledMessage} ${newStatus}`, undo, {
        duration: 2500,
        panelClass: 'todos-notification-overlay'
      })
      .onAction()
      .pipe(take(1))
      .subscribe(() => this.onToggleTodo({ ...todo, done: !todo.done }));
  }

  onRemoveDoneTodos() {
    this.store.dispatch(new ActionTodosRemoveDone());
    const removedMessage = this.translateService.instant('cccc.examples.todos.remove.notification');
    this.notificationService.info(removedMessage);
  }

  onFilterTodos(filter: TodosFilter) {
    this.store.dispatch(new ActionTodosFilter({ filter }));
    const filterToMessage = this.translateService.instant('cccc.examples.todos.filter.notification');
    const filterMessage = this.translateService.instant(`cccc.examples.todos.filter.${filter.toLowerCase()}`);
    this.notificationService.info(`${filterToMessage} ${filterMessage}`);
  }
}
