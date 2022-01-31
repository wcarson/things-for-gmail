import { onCreateTodoClicked, onEmailSelected } from './gmail';
import { onSettingsClicked, onSettingsSaveClicked } from './settings';

// expose functions accessed referenced by appsscript.json
global.onEmailSelected = onEmailSelected;
global.onCreateTodoClicked = onCreateTodoClicked;
global.onSettingsClicked = onSettingsClicked;
global.onSettingsSaveClicked = onSettingsSaveClicked;
