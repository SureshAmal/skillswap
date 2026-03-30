import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

export default async function CertificatesPage() {
  const session = await verifySession();
  if (!session) return null;

  const certificates = await prisma.certificate.findMany({
    where: { userId: session.userId },
    include: { skill: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Certificates</h1>
        <p className="text-muted-foreground">
          Your verified skill certifications
        </p>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Award className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-1">No certificates yet</p>
            <p className="text-sm text-muted-foreground">
              Complete sessions and milestones to earn certificates!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((cert) => (
            <Card key={cert.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm">{cert.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {cert.issuer}
                  </CardDescription>
                </div>
                <Badge
                  variant={cert.verified ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {cert.verified ? "Verified" : "Pending"}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Skill: <span className="font-medium">{cert.skill.name}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Issued: {new Date(cert.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
