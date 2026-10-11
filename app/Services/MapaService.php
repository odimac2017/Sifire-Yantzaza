<?php

namespace App\Services;

class MapaService
{
    public function generarMapa($lat, $lng, $zoom = 17)
    {
        $tileSize = 256;
        $mapWidth = 600;
        $mapHeight = 300;

        $n = pow(2, $zoom);

        $xtile = ($lng + 180) / 360 * $n;
        $ytile = (1 - log(tan(deg2rad($lat)) + 1 / cos(deg2rad($lat))) / M_PI) / 2 * $n;

        $xTile = floor($xtile);
        $yTile = floor($ytile);

        $pixelX = ($xtile - $xTile) * $tileSize;
        $pixelY = ($ytile - $yTile) * $tileSize;

        /* imagen base grande */
        $bigSize = $tileSize * 3;
        $bigImage = imagecreatetruecolor($bigSize, $bigSize);

        $opts = [
            "http" => [
                "method" => "GET",
                "header" => "User-Agent: SistemaInspecciones/1.0\r\n"
            ],
            "ssl" => [
                "verify_peer" => false,
                "verify_peer_name" => false
            ]
        ];

        $context = stream_context_create($opts);

        /* descargar 9 tiles */
        for ($dx = -1; $dx <= 1; $dx++) {
            for ($dy = -1; $dy <= 1; $dy++) {

                $tileX = $xTile + $dx;
                $tileY = $yTile + $dy;

                $url = "https://tile.openstreetmap.org/$zoom/$tileX/$tileY.png";

                $tileData = @file_get_contents($url, false, $context);

                if ($tileData) {
                    $tileImg = imagecreatefromstring($tileData);

                    imagecopy(
                        $bigImage,
                        $tileImg,
                        ($dx + 1) * $tileSize,
                        ($dy + 1) * $tileSize,
                        0,
                        0,
                        $tileSize,
                        $tileSize
                    );

                    imagedestroy($tileImg);
                }
            }
        }

        /* calcular centro real */
        $centerX = $tileSize + $pixelX;
        $centerY = $tileSize + $pixelY;

        $offsetX = $centerX - ($mapWidth / 2);
        $offsetY = $centerY - ($mapHeight / 2);

        /* imagen final */
        $finalImage = imagecreatetruecolor($mapWidth, $mapHeight);

        imagecopy(
            $finalImage,
            $bigImage,
            0,
            0,
            $offsetX,
            $offsetY,
            $mapWidth,
            $mapHeight
        );

        /* marcador */
        $red = imagecolorallocate($finalImage, 255, 0, 0);

        imagefilledellipse(
            $finalImage,
            $mapWidth / 2,
            $mapHeight / 2,
            14,
            14,
            $red
        );

        /* guardar */
        $nombre = "mapa_" . time() . ".png";

        $ruta = storage_path("app/public/mapas/" . $nombre);

        if (!file_exists(dirname($ruta))) {
            mkdir(dirname($ruta), 0755, true);
        }

        imagepng($finalImage, $ruta);

        imagedestroy($bigImage);
        imagedestroy($finalImage);

        return "storage/mapas/" . $nombre;
    }
}