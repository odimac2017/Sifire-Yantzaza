<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Events\AfterSheet;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class CatastrosExport implements 
    FromCollection, 
    WithHeadings, 
    WithStyles, 
    ShouldAutoSize, 
    WithEvents,
    WithCustomStartCell
{
    protected $institucion;
    protected $reporte;
    protected $catastros;

    public function __construct($institucion, $reporte, $catastros)
    {
        $this->institucion = $institucion;    
        $this->reporte = $reporte;
        $this->catastros = $catastros;       
    }

    public function startCell(): string
    {
        return 'A6';
    }

    public function collection()
    {
        $total = $this->catastros->sum('valor_total');

        $rows = $this->catastros->map(function ($catastro, $index) {
            return [
                $index + 1,
                $catastro->numero_formateado,
                $catastro->catastro?->cliente?->documento,
                $catastro->catastro?->cliente?->nombre,
                $catastro->catastro?->clave_catastral,
                $catastro->catastro?->numero_predio,
                $catastro->catastro?->parroquia?->nombre,
                optional($catastro->fecha)->format('Y-m-d'),
                $catastro->valor_total,
                $catastro->estado,
            ];
        });

        // ✅ FILA TOTAL (texto en A porque se va a combinar)
        $rows->push([
            'TOTAL RECAUDADO',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            $total,
            ''
        ]);

        return $rows;
    }

    public function headings(): array
    {
        return [
            '#',
            'Número',
            'Documento',
            'Cliente',
            'Clave catastral',
            'Número predio',
            'Parroquia',
            'Fecha',
            'Valor',
            'Estado',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {

                $sheet = $event->sheet->getDelegate();

                // 🖼️ LOGO
                $drawing = new Drawing();
                $drawing->setPath(public_path('images/logo1.jpg'));
                $drawing->setHeight(80);
                $drawing->setCoordinates('A1');
                $drawing->setWorksheet($sheet);

                // 🏛️ RAZÓN SOCIAL
                $sheet->mergeCells('A1:J1');
                $sheet->setCellValue('A1', $this->institucion->razon_social);
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
                $sheet->getStyle('A1')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // 🧾 RUC
                $sheet->mergeCells('A2:J2');
                $sheet->setCellValue('A2', 'RUC: ' . $this->institucion->ruc);
                $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(12);
                $sheet->getStyle('A2')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // 📑 REPORTE
                $titulo = $this->reporte->numero
                ? 'REPORTE DE RECAUDACIÓN DE CATASTROS N° ' . $this->reporte->numero
                : 'REPORTE DE RECAUDACIÓN DE CATASTROS';

                $sheet->mergeCells('A3:J3');
                $sheet->setCellValue('A3', $titulo);
                $sheet->getStyle('A3')->getFont()->setBold(true);
                $sheet->getStyle('A3')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // 📅 FECHA
                if (strtotime($this->reporte->fecha)) {
                    $fecha = \Carbon\Carbon::parse($this->reporte->fecha)
                        ->locale('es')
                        ->translatedFormat('d \d\e F \d\e Y');
                }else{
                    $fecha = $this->reporte->fecha;
                }

                $sheet->mergeCells('A4:J4');
                $sheet->setCellValue('A4', mb_strtoupper($fecha));
                $sheet->getStyle('A4')->getFont()->setBold(true);
                $sheet->getStyle('A4')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // 🔢 última fila
                $lastRow = $sheet->getHighestDataRow();

                // 🎨 encabezado
                $sheet->getStyle('A6:J6')->applyFromArray([
                    'font' => ['bold' => true],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'D9D9D9'],
                    ],
                ]);

                // 🧱 bordes
                $sheet->getStyle("A6:J{$lastRow}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                        ],
                    ],
                ]);

                // 💰 moneda columnas
                $sheet->getStyle("I7:I{$lastRow}")
                    ->getNumberFormat()
                    ->setFormatCode(NumberFormat::FORMAT_NUMBER_00);

                // 🎯 alineación global
                $sheet->getStyle("A6:J{$lastRow}")
                    ->getAlignment()
                    ->setVertical(Alignment::VERTICAL_CENTER)
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // 🧾 CLAVE CATASTRAL COMO TEXTO (columna E)
                $sheet->getStyle("E7:E{$lastRow}")
                    ->getNumberFormat()
                    ->setFormatCode(NumberFormat::FORMAT_TEXT);

                $sheet->getStyle("F7:F{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_LEFT);

                // 🔁 altura automática
                foreach (range(7, $lastRow) as $row) {
                    $sheet->getRowDimension($row)->setRowHeight(-1);
                }

                // 🔗 combinar A → H
                $sheet->mergeCells("A{$lastRow}:H{$lastRow}");

                // 🎯 alinear texto
                $sheet->getStyle("A{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                // 🎨 fondo
                $sheet->getStyle("A{$lastRow}:J{$lastRow}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'FFF2CC'],
                    ],
                ]);

                // 🔠 negrita + tamaño
                $sheet->getStyle("A{$lastRow}:I{$lastRow}")
                    ->getFont()->setBold(true)->setSize(12);

                // 💲 formato moneda total
                $sheet->getStyle("I{$lastRow}")
                    ->getNumberFormat()
                    ->setFormatCode('"$"#,##0.00');

                $sheet->getStyle("I{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            },
        ];
    }
}