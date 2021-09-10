'use strict';
import AppStore from "../mobx/AppStore";
import Global from "../mobx/Global";
import Download from "../mobx/Download";
import ContractService from "../service/ContractService";
import CountryService from "../service/CountryService";
import DBVersionService from "../service/DBVersionService";
import MessageService from "../service/MessageService";
import PhoneService from "../service/PhoneService";
import PhotoService from "../service/PhotoService";
import {UploadList} from "./UploadList";
import CallService from "./CallService";
import DBACtion from "./DBAction";
import {Containers} from "../TModal/Container";
import GlobalSpace from "../TModal/GlobalSpace";
import {TimerTodoList} from "./TimerTodoList";
import {WebSocketService} from "./webSocket/WebSocketService";
import {DownloadList} from "./DownloadList";
import SendMSService from "../service/SendMSService";
import RecentService from "../service/RecentService";
import ConfigService from "../service/ConfigService";
import OtherService from "../service/OtherService";


export default function iniAppData() {

	GlobalSpace(AppStore, 'AppStore');
	GlobalSpace(Global, 'Global');
	GlobalSpace(Download, 'Download');
	GlobalSpace(ContractService, 'ContractService');
	GlobalSpace(CountryService, 'CountryService');
	GlobalSpace(DBVersionService, 'DBVersionService');
	GlobalSpace(MessageService, 'MessageService');
	GlobalSpace(PhoneService, 'PhoneService');
	GlobalSpace(PhotoService, 'PhotoService');
	GlobalSpace(UploadList, 'UploadList');
	GlobalSpace(CallService, 'CallService');
	GlobalSpace(DBACtion, 'DBACtion');
	GlobalSpace(TimerTodoList, 'TimerTodoList');
	GlobalSpace(WebSocketService, 'WebSocketService');
	GlobalSpace(DownloadList, 'DownloadList');
	GlobalSpace(SendMSService, 'SendMSService');
	GlobalSpace(RecentService, 'RecentService');
	GlobalSpace(ConfigService, 'ConfigService');
	GlobalSpace(OtherService, 'OtherService');

}
