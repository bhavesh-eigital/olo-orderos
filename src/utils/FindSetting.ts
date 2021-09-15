export const findSetting = (storeInformation, settingName) => {

  const settingExist = storeInformation.settings?.find((setting) => {
    return setting.settingName === settingName;
  });
  if (settingExist === undefined) {
    return 'false';
  }
  return storeInformation.settings?.filter((setting) => {
    return setting.settingName === settingName;
  })[0].settingValue;
};
