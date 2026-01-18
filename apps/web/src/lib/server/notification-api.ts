import notificationapi from 'notificationapi-node-server-sdk';
import { config } from '../config';

notificationapi.init(
  config.NOTIFICATION_API_CLIENT_ID, // Client ID
  config.NOTIFICATION_API_CLIENT_SECRET // Client Secret
)

export type NotificationPayload = {
  subject: string,
  template: string,
  to: string,
}

export const sendNotification = async (data: NotificationPayload) => {
  notificationapi.send({
    type: 'watergroove_notification',
    to: {
      id: "waterfallsrealty39@gmai.com",
      email: data.to
    },
    email: {
      subject: data.subject,
      html: data.template
    }
  })
    .then(res => console.log(res.data))

}