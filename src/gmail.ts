import truncate from 'truncate';
import { buildSettingsCard, USER_PROP_EMAIL } from './settings';
import Utils from './utils';

/**
 * Handles displaying the "New To-Do" card when an e-mail is selected.
 *
 * @param {Object} event Event containing the message ID and other context.
 * @returns {Card[]} New To-Do card.
 */
function onEmailSelected(
  event: GoogleAppsScript.Addons.EventObject
): GoogleAppsScript.Card_Service.Card[] {
  const cards: GoogleAppsScript.Card_Service.Card[] = [];

  // open Settings card if user doesn't have the Mail to Things e-mail address configured
  const sendToThingsEmail = PropertiesService.getUserProperties().getProperty(USER_PROP_EMAIL);

  if (!sendToThingsEmail) {
    cards.push(buildSettingsCard());
  } else {
    cards.push(buildNewToDoCard(event));
  }

  return cards;
}

/**
 * Builds and sends the To-Do e-mail to the e-mail configured in Settings.
 *
 * @returns {ActionResponse} Error notification or success notification with redirection to root card.
 */
function onCreateTodoClicked(event: GoogleAppsScript.Addons.EventObject) {
  const message = getCurrentMessage(event);
  const sendToThingsEmail = PropertiesService.getUserProperties().getProperty(USER_PROP_EMAIL);
  const comments = Utils.getFormValue(event, 'comments') || '';

  const body = `${comments}
Original e-mail: ${message.getThread().getPermalink()}
---
Subject: ${message.getSubject()}
From: ${message.getFrom()}
To: ${message.getTo()}
Date: ${message.getDate().toLocaleDateString()}

${cleanBody(message.getPlainBody())}
---`;

  try {
    MailApp.sendEmail(sendToThingsEmail, message.getSubject(), body);

    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(buildSuccessCard()))
      .build();
  } catch (ex: unknown) {
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification().setText(
          'An error occurred while attempting to send new To-Do to things. Please try again.'
        )
      )
      .build();
  }
}

/**
 * Retrieves the current message given an action event object.
 *
 * @param {EventObject} event Object
 * @returns {GmailMessage} Currently selected e-mail
 */
function getCurrentMessage(
  event: GoogleAppsScript.Addons.EventObject
): GoogleAppsScript.Gmail.GmailMessage {
  const accessToken = event.gmail.accessToken;
  const messageId = event.gmail.messageId;
  GmailApp.setCurrentMessageAccessToken(accessToken);

  return GmailApp.getMessageById(messageId);
}

/**
 * Builds the "New To-Do" card.
 *
 * @param {GmailMessage} currently Selected e-mail
 * @returns {Card} The "New To-Do" card.
 */
function buildNewToDoCard(
  event: GoogleAppsScript.Addons.EventObject
): GoogleAppsScript.Card_Service.Card {
  const builder = CardService.newCardBuilder();

  const message = getCurrentMessage(event);

  const todo = truncate(message.getSubject(), 100);
  const notes = truncate(message.getPlainBody(), 500).replace(/\n\s*\n/g, '\n');

  builder.setHeader(
    CardService.newCardHeader()
      .setTitle('New To-Do')
      .setImageUrl(
        'https://lh3.googleusercontent.com/DXjzqDwbW7G-y5CxGS5xbwe5_0hYqp9kWQc4dZtDTEK7z2iuaLLPfXjB30A1zmjbpQti5NIpKVglLTy2ayMu9UiwMtqBvnsGSdyWv0OoyNU9CVpF01xEeAHSbqOf6v2I0-RKJU75daEGD6eVPu-1A3-ruTY68d8_-y3Cec4kPiamsbUwI0Pph9dZ6ZyWubUHGgh7a8Rqn7t8JtroNtogbxf58sGuM_rx-3EJHFMkdxvNQvjZBcOo-jOgJHfaaRX2Q8LdjaLN2C61vt2dDUqDHnTNl9ZhhtbPL-ZJutenFd1fBFtnUC09rLPlEx57Q316NPkUVq_4K8RRXRVe8B4-xpVexEwqgWYWaRP1qGvZWRmfkgqdd8MYjCM4Tci4y1HcmTWXtz4hRwef9nQktMmG0mQiI_RmilJSpc5hVJoJQZRwIQMROa6h7nXGzvifP27_oS74BO5DnaVD-FxMrh6TdGT4J-4NnsSISC3fn9sNZFdgjxSVsEwfmJDPRaMfjXCjf8BkiFYgZ0LkWsRZi0A8lMv9l0o_yfVRiAQIRp1unas6Kc3LDseZTabS6pqOHBDaTEr6JornKwL55qZXZ6YxPetpiyqsztaPcdTfiI66HNK5PiSHFo4-rBnAK0OsTXFFshwLvuXf1zkdh3wD3uuRWKQLN3zKwh6jmLrZlesQbwANDQD3WFZlV_bSERFx1m0uWT96vhoTytvocsrsG7rUM2I'
      )
  );

  const todoPreviewSection = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText(`<b>${todo}</b>`))
    .addWidget(CardService.newTextParagraph().setText(`<font color="#777777">${notes}</font>`));

  const formSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextInput().setFieldName('comments').setTitle('Add notes or comments')
    )
    .addWidget(
      CardService.newTextButton()
        .setText('Create To-Do')
        .setOnClickAction(CardService.newAction().setFunctionName('onCreateTodoClicked'))
    );

  builder.addSection(todoPreviewSection);
  builder.addSection(formSection);

  return builder.build();
}

/**
 * Builds the "Success" card displayed after a new To-Do is created successfully.
 *
 * @returns {Card} The "Success" card.
 */
function buildSuccessCard(): GoogleAppsScript.Card_Service.Card {
  const builder = CardService.newCardBuilder();

  builder.setHeader(
    CardService.newCardHeader()
      .setTitle('To-Do sent to Things successfully')
      .setImageUrl(
        'https://lh3.googleusercontent.com/ckVareA4nA-eo44l6UGTbQyhwV4GX2DUrBFbWM7Qkl-Jk9xLtMy9VVE1X54bA1cucSc4XRVk-6h8ECPNie_-WhfK_yZfwNcLfsgfOe3AadzpYFQsLIqRmxLVGpw3MVA8LjCDUbynZyJSRSzG2R1L1OIRTZuuCrI87BrDY262jJxECVn_hqyO9wrtSAAWlqxxWiuZXSQc5tK8L6SsEiGjTppCepvJAxT5ZiKiS_hgoTDuaqutZAQ16AfvUhhe4DYEbU56j9PRq69i3rYUogZRehzn05NCsGUa-qYPQwXYBBmPfqEIdrOtBTfucWcmSD8VFSYlSc2wtV6UIM6MeIb_MpluxukhFWJvqI4jgR1esXlSAXNcYRY2JfZOsk78-BGFXkuu2asotVM0haPS2c37eFImICRoBiyoGK76Uir9ksa140LCd_sPUzGI3HiOwjOWo76WpNivUhNjEXDxBYdfYnCkFj3ZRkY1HlG1ZRH0pSoZmhE5JuXqO5WqwrBBXVUU3TcOAOb50_Gmlq75iQ2QVgr3ziVlQtXy81n51ouioc0jN7f4I0fJ7ohSNaqHP-vtNZhrkLZ2XhbQttpMY8Lo2XuLtAnAVTJ_cY9mjEBnZzk410_iRw7yJTmJBRPEhl1yBAiK0Q61wjgpjGLJAS2lwIJ1D8ppbD7bFq4JWI_2Scg7I1tb_lZziJzDYVhkIz4ZYuTyLfi4PdpVCvTYDhxnMaI'
      )
  );

  const body = CardService.newCardSection()
    .addWidget(
      CardService.newImage().setImageUrl(
        'https://lh3.googleusercontent.com/W-E_Oa0bePoX3GdR1snlJgNvPVJ34bYPr-H8ee7pxjZMChILqZTHyttEufsBK21bExmgRIEhTfctqCvanWfkNSyHfEXNRx3HWRTXxqZq-oYUFCHHSecNDZB6fPv-FRqEKucDqte1XxYHVWhdV10rJ2Cn2WgepxZ33Tz0-VOz5eYmj9J6NL542T28oL1WqPFRmixGvGQNjLTP_Td4aPy3pNV0dTK_z4h_jcuvoy_L80XzgNKtvT0Yp_992vuGbd4secTWEPrw0o7r7qExMNqUgOHL2Wkhg_likhAEApp92pdd4nn0nePuR5vHeU0U-CGMIq9a8blBYUV5fGapYVE2i5ZXpcKwKJxY1D62BZKBy5VHv7c-gbppRNOmec4Kz5YMQKSclUhT_He60Y5rNJ54movT7-b2bfA4o5f_3mPOt_vqMB4ONbB10u9SO4cVaF7wZt8AfYMW0yevL8qi9zjgDEKe2MiqgyouzNDE0LD-KJnXNOfTFooDD5SssKUqmGwgcfl077Pfdk6ZCbalh_4jYf-ftWeLJ0AKRyWlLZfK7j6UyiZnFwkVt0DrmCl8tYQqHxLl1mpA0FKets1SriraNdjDdDtFJXTib1FoWpz00u8pebFVmo28XPVL-88wHZou6MbQ0Jx6zOw0pG04XliWA-iKXVS5Q-JqSUfHYGIQzLlBplIL7dKmYG0PdslsdLTcjIZGvTo1qWfN1ITC79EL7c4'
      )
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#777777">If you don\'t see the new To-Do in your Things Inbox, check your Mail to Things configuration and verify your Mail to Things e-mail address is correct in Settings'
      )
    );

  builder.addSection(body);

  return builder.build();
}

/**
 * Cleans up plain text body by removing extra line breaks, etc.
 *
 * @param {string} The E-mail body.
 * @returns {string} Cleaned up body
 */
function cleanBody(body: string): string {
  return body.replace(/\n\s*\n/g, '\n');
}

export { buildNewToDoCard, onCreateTodoClicked, onEmailSelected };
