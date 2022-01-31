import Utils from './utils';
import { buildNewToDoCard } from './gmail';

const USER_PROP_EMAIL = 'mailToThingsEmail';
const EMAIL_REGEX = /.*@things.email/;

/**
 * Displays the Settings card when the Settings universal action is clicked.
 *
 * @returns {UniversalActionResponse}
 */
function onSettingsClicked(): GoogleAppsScript.Card_Service.UniversalActionResponse {
  return CardService.newUniversalActionResponseBuilder()
    .displayAddOnCards([buildSettingsCard()])
    .build();
}

/**
 * Validates and saves the user's settings.
 *
 * @returns {ActionResponse} Error notification or success notification with redirection to root card.
 */
function onSettingsSaveClicked(
  event: GoogleAppsScript.Addons.EventObject
): GoogleAppsScript.Card_Service.ActionResponse {
  const email = Utils.getFormValue(event, 'mailToThingsEmail');

  if (validateEmail(email)) {
    PropertiesService.getUserProperties().setProperty(USER_PROP_EMAIL, email);

    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('Settings saved successfully.'))
      .setNavigation(CardService.newNavigation().popToRoot().updateCard(buildNewToDoCard(event)))
      .build();
  } else {
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification().setText('Please enter a valid Mail to Things e-mail address.')
      )
      .build();
  }
}

/**
 * Builds the "Settings" card.
 *
 * @returns {Card} Settings card
 */
function buildSettingsCard(): GoogleAppsScript.Card_Service.Card {
  const email = PropertiesService.getUserProperties().getProperty(USER_PROP_EMAIL) || '';

  const builder = CardService.newCardBuilder();

  builder.setHeader(
    CardService.newCardHeader()
      .setTitle('<b>Settings</b>')
      .setImageUrl(
        'https://lh3.googleusercontent.com/mFGO91FrZ32SkIym9SWwafTRzgQYdZGucjBovepIi59s8c-H076kWYANgbhqDQfB6YsBCQ-G9ML76bvDGnknFP24iBHC4oSFmSD1YAhM6VGOMrc1V1MCxzvpbfO44VJMk7ZFboJzJyFe2f1Kzur4kEqpsoGcVOgaeDO7WvptQIe6dj_MjteFPazk7AeDniZfalHv5yLGfJhJzbwqUwweCnEwiXvITq504pmoM3zfuRog3oGTadVJoXbGQh9ga1YWxywzKspwoLLU_jwYR7uc7J7AEn7hux4H-8m2-ksd_KvH9o2X7AGeoAHygQ3XEHb6EcQ1B-aVYzWcdpCt-FgRwntjuRJBoBWX9I_h1iWAe9eSCUZxb_2PX1c2pGHekSpVsYkbHUNM5VvKBzmKRFobyXXslLckRz_M16IEdxr9cVsZ5kMoEf7B6Fk3kjjo28yevH1n1AUmLLOWycB0UQeLT2IepBP5Npr3l2hAspkrx87tguBf_Vr6D0_ZHTKYpKRf3WTjwSZHWWM3kZxQw1T4fovdfMPtra56T-ELsv2PPchU8Qjt5s0FFu3NAnA7A5t9zKujrqYnuuM7ftQrA2YXC10HhWbUtLu7PhShGKW6b04PyaSKKhcRSpNtEHDwzcEYcla1PnMOrrHPSUEvar4NL9CTBAX4gc35dknh1ItXrkNPdcPfjs6PrL8kOGtP8XF_keD4b8PNJgfE3jccmMnYf1g'
      )
      .setImageStyle(CardService.ImageStyle.CIRCLE)
  );

  const descriptionSection = CardService.newCardSection().addWidget(
    CardService.newTextParagraph().setText(
      'Please see the <a href="https://culturedcode.com/things/support/articles/2908262/">Things support documentation</a> on enabling Mail to Things and obtaining the <i>@things.email</i> e-mail address.'
    )
  );

  const formSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextInput()
        .setFieldName('mailToThingsEmail')
        .setTitle('Mail to Things Email Address')
        .setValue(email)
    )
    .addWidget(
      CardService.newTextButton()
        .setText('Save')
        .setOnClickAction(CardService.newAction().setFunctionName('onSettingsSaveClicked'))
    );

  builder.addSection(descriptionSection);
  builder.addSection(formSection);

  return builder.build();
}

/**
 * Validates if e-mail is valid Mail to Things address.
 *
 * @param {string} e-mail Address to validate
 * @returns {boolean} True if e-mail is valid, false otherwise.
 */
function validateEmail(email: string): boolean {
  return email && EMAIL_REGEX.test(email);
}

export { buildSettingsCard, onSettingsClicked, onSettingsSaveClicked, USER_PROP_EMAIL };
