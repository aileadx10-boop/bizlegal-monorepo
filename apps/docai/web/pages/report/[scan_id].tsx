import type { GetServerSideProps } from "next";

type Params = {
  scan_id: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const params = context.params as Params | undefined;
  const scanId = params?.scan_id || "";

  if (!scanId) {
    return {
      redirect: {
        destination: "/report",
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: `/report?scan_id=${encodeURIComponent(scanId)}`,
      permanent: false,
    },
  };
};

export default function ReportRedirectPage() {
  return null;
}
