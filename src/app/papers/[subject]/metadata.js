export async function generateMetadata({ params }) {
  const subject = params.subject;
  const formattedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);

  return {
    title: `Edexcel ${formattedSubject} Past Papers | Free Download`,
    description: `Download free Edexcel ${formattedSubject} past papers, mark schemes and examiner reports. Complete collection from 2015-2023.`,
    keywords: `edexcel past papers, ${subject} past papers, edexcel ${subject} exam papers, ${subject} revision, edexcel ${subject} practice papers`,
  };
}
