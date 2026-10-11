import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.security.*;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.Certificate;

public class FirmadorPDF {

    public static void main(String[] args) {

        try {

            // 🔴 VALIDACIÓN DE ENTRADA
            if (args.length < 6) {
                System.out.println("ERROR: Uso -> src dest keystore password x y");
                System.exit(1);
            }

            String src = args[0];
            String dest = args[1];
            String keystore = args[2];
            String password = args[3];
            float x = Float.parseFloat(args[4]);
            float y = Float.parseFloat(args[5]);

            // 🔐 Cargar certificado
            KeyStore ks = KeyStore.getInstance("PKCS12");
            ks.load(new FileInputStream(keystore), password.toCharArray());

            String alias = ks.aliases().nextElement();

            PrivateKey pk = (PrivateKey) ks.getKey(alias, password.toCharArray());
            Certificate[] chain = ks.getCertificateChain(alias);

            PdfReader reader = new PdfReader(src);
            FileOutputStream os = new FileOutputStream(dest);

            PdfStamper stamper = PdfStamper.createSignature(reader, os, '\0', null, true);
            PdfSignatureAppearance appearance = stamper.getSignatureAppearance();

            appearance.setReason("Firma digital");
            appearance.setLocation("Ecuador");

            int lastPage = reader.getNumberOfPages();
            AcroFields fields = reader.getAcroFields();

            String nombreFirma = "sig1";
            int i = 1;

            while (fields.getField(nombreFirma) != null) {
                i++;
                nombreFirma = "sig" + i;
            }

            appearance.setVisibleSignature(
                    new Rectangle(x, y, x + 150, y + 50),
                    lastPage,
                    nombreFirma
            );

            ExternalSignature pks = new PrivateKeySignature(pk, "SHA256", null);
            ExternalDigest digest = new BouncyCastleDigest();

            MakeSignature.signDetached(
                    appearance,
                    digest,
                    pks,
                    chain,
                    null,
                    null,
                    null,
                    0,
                    MakeSignature.CryptoStandard.CMS
            );

            System.out.println("OK: PDF firmado correctamente");
            System.exit(0);

        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            System.exit(2);
        }
    }
}