import mailtrap as mt
import vars as VARS

class EmailDriver(object):
    def __init__(self):
        super(EmailDriver, self).__init__()
        
        mailtrap_token = open(VARS.mailtrap_token, 'r').read().strip()
        self.client = mt.MailtrapClient(token=mailtrap_token)

    def send_email(self, recipient=None, subject=None, category=None ,html_page=None):
        mail = mt.Mail(
            sender=mt.Address(email="noreply@buddybudget.net", name="Buddy Budget"),
            to=[mt.Address(email=recipient)],
            subject=subject,
            html = html_page,
            category=category,
        )

        result = self.client.send(mail)
        return result
