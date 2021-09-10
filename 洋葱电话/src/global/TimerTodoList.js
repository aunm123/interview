'use strict';

export class TimerTodoList {

	timer = null;
	runing = false;

	initTimer() {

		this.todoList = [];
		// 每秒触发事件执行器
		this.timer = setInterval(() => {
			if (!this.runing) {
				this.runing = true;

				for (let item: TodoAction of this.todoList) {
					if (item.currentTimeCount >= item.timeUp) {
						if (item.action) {
							item.action();
							item.currentRunTime += 1;
							item.currentTimeCount = 0;
						}
						if (item.currentRunTime >= item.runCount && item.runCount > 0) {
							this.todoList.splice(this.todoList.indexOf(item), 1);
						}
					} else {
						item.currentTimeCount += 1;
					}
				}

				this.runing = false;
			}
		}, 1000)
	}

	addTodoAction(item: TodoAction) {
		if (item) {
			// 防止重复添加
			let needAdd = true;
			for (let temp of this.todoList) {
				if (temp.name == item.name) {
					needAdd = false;
					break;
				}
			}
			if (needAdd) {
				this.todoList.push(item)
			}
		}
	}

	removeTodoAction(name){
		try {
			for (let item: TodoAction of this.todoList) {
				if (item.name == name) {
					this.todoList.splice(this.todoList.indexOf(item), 1);
					break;
				}
			}
		}catch (e) {}
	}

	destroy() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
			this.runing = false;
		}
	}
}

export class TodoAction {
	name;
	action;
	timeUp;
	runCount;

	currentTimeCount = 1;
	currentRunTime = 0;

	/**
	 * TODO类
	 * @param name 唯一名称
	 * @param action function 触发的事件
	 * @param timeUp 多少秒触发一次
	 * @param runCount 一共触发多少次 -1为无限制
	 */
	constructor(name, action, timeUp = 1, runCount = -1) {
		this.name = name;
		this.timeUp = timeUp;
		this.action = action;
		this.runCount = runCount;
	}
}
