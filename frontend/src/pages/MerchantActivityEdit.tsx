import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MerchantForm } from '../components/MerchantForm';
import { getActivityDetail, updateMerchantActivity } from '../api/endpoints';
import type { MerchantActivityInput } from '../types';

export default function MerchantActivityEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const activityId = Number(id);

  const [initialValue, setInitialValue] = useState<MerchantActivityInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(activityId)) {
      return;
    }

    getActivityDetail(activityId)
      .then((activity) => {
        setInitialValue({
          title: activity.title,
          description: activity.description,
          coverUrl: activity.coverUrl ?? '',
          location: activity.location,
          category: activity.category,
          maxCapacity: activity.maxCapacity,
          price: activity.price,
          enrollOpenAt: activity.enrollOpenAt,
          enrollCloseAt: activity.enrollCloseAt,
          activityAt: activity.activityAt,
        });
      })
      .finally(() => setLoading(false));
  }, [activityId]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[32px] border border-rose-100 bg-[linear-gradient(135deg,#fff7f1_0%,#ffffff_58%,#fff1eb_100%)] px-6 py-8 shadow-[0_24px_60px_-40px_rgba(225,29,72,0.28)] lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-400">UAAD</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          {t('merchant.editActivity')}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 lg:text-base">
          {t('merchant.editSubtitle')}
        </p>
      </section>

      {!Number.isFinite(activityId) ? (
        <div className="rounded-[32px] border border-amber-200 bg-amber-50 p-8 text-sm text-amber-700">
          {t('activityDetail.invalidId')}
        </div>
      ) : loading || !initialValue ? (
        <div className="rounded-[32px] border border-rose-100 bg-white p-8 text-slate-500 shadow-sm">
          {t('merchant.loading')}
        </div>
      ) : (
        <MerchantForm
          initialValue={initialValue}
          loading={submitting}
          submitLabel={t('merchant.editSubmit')}
          onSubmit={async (payload) => {
            setSubmitting(true);
            await updateMerchantActivity(activityId, payload);
            setSubmitting(false);
            navigate('/merchant/activities', { state: { message: t('merchant.editSuccess') } });
          }}
        />
      )}
    </div>
  );
}
