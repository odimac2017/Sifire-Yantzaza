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

class NotasCreditosExport implements 
    FromCollection, 
    WithHeadings, 
    WithStyles, 
    ShouldAutoSize, 
    WithEvents,
    WithCustomStartCell
{
    protected $institucion;
    protected $notasCreditos;

    public function __construct($institucion, $notasCreditos)
    {
        $this->institucion = $institucion;    
        $this->notasCreditos = $notasCreditos;   
    }

    public function startCell(): string
    {
        return 'A5';
    }

    public function collection()
    {
        $total = $this->notasCreditos->sum('valor_total');
        $totalSaldo = $this->notasCreditos->sum('saldo');

        $rows = $this->notasCreditos->map(function ($notaCredito, $index) {
            return [
                $index + 1,
                $notaCredito->cliente?->documento,
                $notaCredito->cliente?->nombre,
                $notaCredito->actividadEconomica?->e_nombre_comercial,
                $notaCredito->valor_total,
                $notaCredito->saldo,
                $notaCredito->observaciones,
            ];
        });

        // ✅ FILA TOTAL (texto en A porque se va a combinar)
        $rows->push([
            'TOTALES',
            '',
            '',
            '',
            $total,
            $totalSaldo,
            ''
        ]);

        return $rows;
    }

    public function headings(): array
    {
        return [
            '#',
            'Documento',
            'Cliente',
            'Actividad económica',
            'Valor',
            'Saldo',
            'Observaciones',
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
                $sheet->mergeCells('A1:G1');
                $sheet->setCellValue('A1', $this->institucion->razon_social);
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
                $sheet->getStyle('A1')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // 🧾 RUC
                $sheet->mergeCells('A2:G2');
                $sheet->setCellValue('A2', 'RUC: ' . $this->institucion->ruc);
                $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(12);
                $sheet->getStyle('A2')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);
                
                // 📑 REPORTE
                $titulo = 'REPORTE DE NOTAS DE CRÉDITO';

                $sheet->mergeCells('A3:G3');
                $sheet->setCellValue('A3', $titulo);
                $sheet->getStyle('A3')->getFont()->setBold(true);
                $sheet->getStyle('A3')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // 🔢 última fila
                $lastRow = $sheet->getHighestDataRow();

                // 🎨 encabezado
                $sheet->getStyle('A5:G5')->applyFromArray([
                    'font' => ['bold' => true],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'D9D9D9'],
                    ],
                ]);

                // 🧱 bordes
                $sheet->getStyle("A5:G{$lastRow}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                        ],
                    ],
                ]);

                // 💰 moneda columnas
                $sheet->getStyle("E6:F{$lastRow}")
                    ->getNumberFormat()
                    ->setFormatCode(NumberFormat::FORMAT_NUMBER_00);

                // 🎯 alineación global
                $sheet->getStyle("A5:G{$lastRow}")
                    ->getAlignment()
                    ->setVertical(Alignment::VERTICAL_CENTER)
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                $sheet->getStyle("G6:G{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_LEFT);

                // 🔁 altura automática
                foreach (range(6, $lastRow) as $row) {
                    $sheet->getRowDimension($row)->setRowHeight(-1);
                }

                // 🔗 combinar A → H
                $sheet->mergeCells("A{$lastRow}:D{$lastRow}");

                // 🎯 alinear texto
                $sheet->getStyle("A{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // 🎨 fondo
                $sheet->getStyle("A{$lastRow}:G{$lastRow}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'FFF2CC'],
                    ],
                ]);

                // 🔠 negrita + tamaño
                $sheet->getStyle("A{$lastRow}:G{$lastRow}")
                    ->getFont()->setBold(true)->setSize(12);

                // 💲 formato moneda total
                $sheet->getStyle("E{$lastRow}:F{$lastRow}")
                    ->getNumberFormat()
                    ->setFormatCode('"$"#,##0.00');

                $sheet->getStyle("E{$lastRow}:F{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            },
        ];
    }
}