import type { Metadata } from "next";
import Link from "next/link";
import { SITE_INFO } from "../lib/site-config";

export const metadata: Metadata = {
  title: "후원안내",
  description:
    "사단법인 외국인과 동행 후원안내입니다. 지정기부금 단체로서 CMS 및 계좌이체 후원 참여가 가능하며 기부금 영수증을 발급해드립니다.",
};

const SUPPORT_ACCOUNT = {
  bank: "농협",
  number: "351-0608-4977-43",
  holder: "사단법인 외국인과 동행",
};

export default function SupportPage() {
  return (
    <>
      <PageHero />
      <SupportIntroSection />
      <SupportMethodsSection />
      <ReceiptSection />
      <ContactSection />
    </>
  );
}

function PageHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="paper-texture absolute inset-0 -z-10" />
      <div className="absolute -right-32 -top-24 -z-10 h-[500px] w-[500px] rounded-full bg-[var(--color-terracotta)]/8 blur-3xl" />
      <div className="absolute -left-24 top-32 -z-10 h-[400px] w-[400px] rounded-full bg-[var(--color-sage)]/10 blur-3xl" />

      <div className="mx-auto max-w-[1280px] px-6 pb-20 pt-16 lg:px-10 lg:pb-28 lg:pt-24">
        <nav
          aria-label="현재 위치"
          className="flex items-center gap-3 border-b border-[var(--color-line)] pb-6 animate-fade-in"
        >
          <Link
            href="/"
            className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-terracotta)]"
          >
            Home
          </Link>
          <span className="h-px w-6 bg-[var(--color-line)]" />
          <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
            Donation
          </span>
        </nav>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <p className="font-[var(--font-display)] text-[12px] uppercase tracking-[0.3em] text-[var(--color-terracotta)] animate-fade-up">
              ─ Donation
            </p>
            <h1 className="mt-6 font-[var(--font-serif)] text-[44px] font-medium leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)] animate-fade-up sm:text-[60px] lg:text-[80px]">
              <span className="block">후원안내</span>
            </h1>
          </div>

          <aside className="self-end border-l border-[var(--color-line)] pl-8 lg:col-span-4">
            <p className="font-[var(--font-serif)] text-[15px] leading-[1.85] text-[var(--color-ink-soft)]">
              여러분의 작은 후원이 외국인근로자와 다문화가정의 안정적인 정착과 따뜻한 일상을 만드는
              큰 힘이 됩니다.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function SupportIntroSection() {
  return (
    <section className="bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <blockquote className="font-[var(--font-serif)] text-[24px] leading-[1.6] tracking-[-0.01em] text-[var(--color-ink)] sm:text-[30px] md:text-[36px] md:leading-[1.5]">
          <span className="font-[var(--font-display)] text-5xl text-[var(--color-terracotta)]">“</span>{" "}
          본 법인은 기획재정부에 등록된 지정기부금 단체로, 기부하신 내용에 대해 기부금 영수증을
          발급해드리고 있습니다.
        </blockquote>
      </div>
    </section>
  );
}

function SupportMethodsSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          <article className="relative overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream)] p-8 lg:p-10">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-terracotta)]/20 via-[var(--color-cream)] to-[var(--color-cream-dark)]" />
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              01 · CMS
            </p>
            <h2 className="mt-6 font-[var(--font-serif)] text-3xl font-semibold text-[var(--color-ink)]">CMS 납부</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
              CMS 신청서를 작성하여 제출해 주시면 익월부터 자동으로 출금됩니다.
            </p>
            <p className="mt-5 text-[13px] text-[var(--color-muted)]">※ CMS 신청서는 법인에 문의해 주세요.</p>
          </article>

          <article className="relative overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream)] p-8 lg:p-10">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-sage)]/20 via-[var(--color-cream)] to-[var(--color-cream-dark)]" />
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              02 · Personal Donation
            </p>
            <h2 className="mt-6 font-[var(--font-serif)] text-3xl font-semibold text-[var(--color-ink)]">개인후원</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
              후원계좌로 납부 후 연락을 주시면 개인정보 및 입금내역 확인 후 기부금 영수증을 발급해
              드립니다.
            </p>

            <div className="mt-6 border-t border-[var(--color-line)] pt-5">
              <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                후원계좌
              </p>
              <p className="mt-2 font-[var(--font-serif)] text-xl font-semibold text-[var(--color-ink)]">
                {SUPPORT_ACCOUNT.bank} {SUPPORT_ACCOUNT.number}
              </p>
              <p className="mt-1 text-[14px] text-[var(--color-ink-soft)]">예금주: {SUPPORT_ACCOUNT.holder}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function ReceiptSection() {
  return (
    <section className="bg-[var(--color-cream-dark)] py-16">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <div className="border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] p-6">
          <p className="text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
            기부금 영수증 발급을 위해 후원 후 반드시 연락 부탁드립니다. 연락 시 후원자 성함, 연락처,
            입금일을 함께 알려주시면 빠르게 확인해 드립니다.
          </p>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-ink)] py-20 text-[var(--color-cream)]">
      <div className="relative mx-auto max-w-[1100px] px-6 lg:px-10">
        <h2 className="font-[var(--font-serif)] text-3xl md:text-5xl">
          후원 문의는 <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta-soft)]">언제든</em>{" "}
          가능합니다.
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <a href={`tel:${SITE_INFO.phone.replace(/-/g, "")}`} className="border border-[var(--color-cream)]/20 p-5">
            <p className="text-[11px] text-[var(--color-terracotta-soft)]">전화</p>
            <p className="mt-1">{SITE_INFO.phone}</p>
          </a>
          <a href={`mailto:${SITE_INFO.email}`} className="border border-[var(--color-cream)]/20 p-5">
            <p className="text-[11px] text-[var(--color-terracotta-soft)]">이메일</p>
            <p className="mt-1">{SITE_INFO.email}</p>
          </a>
          <div className="border border-[var(--color-cream)]/20 p-5">
            <p className="text-[11px] text-[var(--color-terracotta-soft)]">팩스</p>
            <p className="mt-1">{SITE_INFO.fax}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
