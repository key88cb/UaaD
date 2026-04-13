import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MerchantForm } from '../components/MerchantForm';
import { createMerchantActivity } from '../api/endpoints';

export default function MerchantActivityNewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[32px] border border-rose-100 bg-[linear-gradient(135deg,#fff7f1_0%,#ffffff_58%,#fff1eb_100%)] px-6 py-8 shadow-[0_24px_60px_-40px_rgba(225,29,72,0.28)] lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-400">UAAD</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          {t('merchant.createActivity')}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 lg:text-base">
          {t('merchant.createSubtitle')}
        </p>
      </section>

      <MerchantForm
        loading={loading}
        submitLabel={t('merchant.createSubmit')}
        onSubmit={async (payload) => {
          setLoading(true);
          await createMerchantActivity(payload);
          setLoading(false);
          navigate('/merchant/activities', { state: { message: t('merchant.createSuccess') } });
        }}
      />
    </div>
  );
}
