import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MerchantForm } from '../components/MerchantForm';
import { createMerchantActivity } from '../api/endpoints';
import { getRequestErrorMessage } from '../utils/requestErrorMessage';

export default function MerchantActivityNewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-black text-white">{t('merchant.createActivity')}</h2>
        <p className="mt-2 text-slate-300">{t('merchant.createSubtitle')}</p>
      </div>

      {submitError ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {submitError}
        </div>
      ) : null}

      <MerchantForm
        loading={loading}
        submitLabel={t('merchant.createSubmit')}
        onSubmit={async (payload) => {
          setSubmitError('');
          setLoading(true);
          try {
            await createMerchantActivity(payload);
            navigate('/merchant/activities', { state: { message: t('merchant.createSuccess') } });
          } catch (err) {
            setSubmitError(getRequestErrorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
}
