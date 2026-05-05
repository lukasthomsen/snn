import { Button, Select, Textarea } from "@snn/ui";
import { isLocale } from "@snn/i18n";

import { createPrivacyRequestAction } from "../actions";
import { requireAccountSession } from "../account-auth";

type PrivacyPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";

  await requireAccountSession(safeLocale, `/${safeLocale}/account/privacy`);

  return (
    <div className="account__stack__SW1a8">
      <header className="account__section-header__SW1a9">
        <h2>Privacy</h2>
        <p className="account__muted__SW1aa">
          Requests are reviewed, audited, and completed through our privacy workflow.
        </p>
      </header>

      <section className="account__panel__SW1ad">
        <form action={createPrivacyRequestAction.bind(null, safeLocale)} className="account__form__SW1ak">
          <Select fullWidth label="Request type" name="type" size="md">
            <option value="access">Access my data</option>
            <option value="portability">Export my data</option>
            <option value="rectification">Correct my data</option>
            <option value="deletion">Request deletion</option>
          </Select>
          <Textarea
            fullWidth
            label="Notes"
            name="notes"
            placeholder="Add any details that help the privacy team handle the request."
            size="md"
          />
          <Button size="lg" type="submit">
            Submit request
          </Button>
        </form>
      </section>
    </div>
  );
}
