package com.firma.service;

import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.security.*;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.Certificate;

import org.springframework.stereotype.Service;

@Service
public class FirmaService {

    public void firmar(
            String src,
            String dest,
            String keystore,
            String password,
            float x,
            float y
    ) throws Exception {

        PdfReader reader = null;
        PdfStamper stamper = null;

        try {

            // 🔐 Cargar certificado
            KeyStore ks = KeyStore.getInstance("PKCS12");

            try (FileInputStream ksStream = new FileInputStream(keystore)) {
                ks.load(ksStream, password.toCharArray());
            }

            String alias = ks.aliases().nextElement();

            PrivateKey pk = (PrivateKey) ks.getKey(alias, password.toCharArray());
            Certificate[] chain = ks.getCertificateChain(alias);

            // 📄 PDF origen
            reader = new PdfReader(src);

            FileOutputStream os = new FileOutputStream(dest);

            stamper = PdfStamper.createSignature(reader, os, '\0', null, true);

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

            float finalX = x;
            float finalY = y;

            appearance.setVisibleSignature(
                    new Rectangle(finalX, finalY, finalX + 150, finalY + 50),
                    lastPage,
                    nombreFirma
            );

            // 🔏 Firma digital
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

        } finally {

            // 🔒 cerrar recursos SIEMPRE

            if (stamper != null) {
                stamper.close();
            }

            if (reader != null) {
                reader.close();
            }
        }
    }
}