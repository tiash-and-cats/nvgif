using System;
using System.Drawing;
using System.Windows.Forms;
using NVGIF;

namespace NVGIFTest
{
    class Program
    {
        [STAThread] // required for WinForms
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.Run(new NVGIFViewerForm());
        }
    }

    public class NVGIFViewerForm : Form
    {
        private PictureBox pictureBox;

        public NVGIFViewerForm()
        {
            this.Text = "NVGIF Viewer";
            this.Width = 600;
            this.Height = 600;

            pictureBox = new PictureBox
            {
                Dock = DockStyle.Fill,
                SizeMode = PictureBoxSizeMode.Zoom
            };
            this.Controls.Add(pictureBox);

            byte[] bytes = System.IO.File.ReadAllBytes("../images/drawing.nvg");
            Bitmap bmp = NVGIF.NVGIF.Decode(bytes);
            pictureBox.Image = bmp;
        }
    }
}