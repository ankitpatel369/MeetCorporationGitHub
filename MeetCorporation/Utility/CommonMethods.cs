using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Xml;
using System.Xml.Serialization;

namespace MeetCorporation.Utility
{
    public class CommonMethods
    {
        public static bool SendOTPCode(string mobile, string message)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create("http://login.redsms.in/API/SendMessage.ashx?user=dhavalpokiya&password=pokiya155&phone=" + mobile.Trim() + "&text=" + message + "&type=t&senderid=DBCACC");
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            Stream stream = response.GetResponseStream();
            StreamReader reader = new StreamReader(stream);
            string result = reader.ReadToEnd();
            reader.Close();
            if (result.Contains("sent"))
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        public static int RendomNumber()
        {
            Random rnd = new Random();
            return rnd.Next(100000, 999999);
        }

        public static XmlDocument ConvertToXml(Object list)
        {
            XmlDocument xmlDoc = new XmlDocument();
            XmlSerializer xmlSerializer = new XmlSerializer(list.GetType());
            using (MemoryStream xmlStream = new MemoryStream())
            {
                xmlSerializer.Serialize(xmlStream, list);
                xmlStream.Position = 0;
                xmlDoc.Load(xmlStream);
                return xmlDoc;
            }
        }

        public static String Encrypt(string toEncrypt, bool useHashing)
        {
            byte[] keyArray;
            byte[] toEncryptArray = UTF8Encoding.UTF8.GetBytes(toEncrypt);
            //  Dim toEncryptArray As Byte() = UTF32Encoding.UTF32.GetBytes(toEncrypt)
            AppSettingsReader settingsReader = new AppSettingsReader();
            //  Get the key from config file
            string key = Convert.ToString((settingsReader.GetValue("SecurityKey", typeof(String))));


            // key = "AdeF5ty6Fr456Mw###"
            // System.Windows.Forms.MessageBox.Show(key)
            if (useHashing)
            {
                MD5CryptoServiceProvider hashmd5 = new MD5CryptoServiceProvider();
                keyArray = hashmd5.ComputeHash(UTF8Encoding.UTF8.GetBytes(key));
                // keyArray = hashmd5.ComputeHash(UTF32Encoding.UTF32.GetBytes(key))
                hashmd5.Clear();
            }
            else
            {
                keyArray = UTF8Encoding.UTF8.GetBytes(key);
                // keyArray = UTF32Encoding.UTF32.GetBytes(key)
            }
            TripleDESCryptoServiceProvider tdes = new TripleDESCryptoServiceProvider();
            tdes.Key = keyArray;
            tdes.Mode = CipherMode.ECB;
            tdes.Padding = PaddingMode.PKCS7;
            ICryptoTransform cTransform = tdes.CreateEncryptor();
            byte[] resultArray = cTransform.TransformFinalBlock(toEncryptArray, 0, toEncryptArray.Length);
            tdes.Clear();
            return Convert.ToBase64String(resultArray, 0, resultArray.Length);
        }

        public static String Decrypt(string cipherString, bool useHashing)
        {
            byte[] keyArray;
            byte[] toEncryptArray = Convert.FromBase64String(cipherString);
            System.Configuration.AppSettingsReader settingsReader = new AppSettingsReader();
            // Get your key from config file to open the lock!
            string key = Convert.ToString((settingsReader.GetValue("SecurityKey", typeof(String))));

            if (useHashing)
            {
                MD5CryptoServiceProvider hashmd5 = new MD5CryptoServiceProvider();
                keyArray = hashmd5.ComputeHash(UTF8Encoding.UTF8.GetBytes(key));
                // keyArray = hashmd5.ComputeHash(UTF32Encoding.UTF32.GetBytes(key))
                hashmd5.Clear();
            }
            else
            {
                keyArray = UTF8Encoding.UTF8.GetBytes(key);
                // keyArray = UTF32Encoding.UTF32.GetBytes(key)
            }
            TripleDESCryptoServiceProvider tdes = new TripleDESCryptoServiceProvider();
            tdes.Key = keyArray;
            tdes.Mode = CipherMode.ECB;
            tdes.Padding = PaddingMode.PKCS7;
            ICryptoTransform cTransform = tdes.CreateDecryptor();
            byte[] resultArray = cTransform.TransformFinalBlock(toEncryptArray, 0, toEncryptArray.Length);
            tdes.Clear();
            return UTF8Encoding.UTF8.GetString(resultArray);
        }
    }
}