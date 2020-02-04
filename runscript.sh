#!/bin/bash
#source /home/rok/root/bin/thisroot.sh;
source /opt/root/bin/thisroot.sh;
root -b <<EOL

int bla(int c){
 return c*c;
}
printf("cccc %d\n", bla(10));

TH1* h1 = new TH1I("h1","title",100, 0, 10);
h1->FillRandom("gaus",10000);
TString json = TBufferJSON::ConvertToJSON(h1);
cout << "Data" << json.Data() << endl;
FILE *fp=fopen("hpx.json","wb");
if (fp){
  json.Puts(fp);
  fclose(fp);
}
EOL
for ((i=0;i<5;i++)) ; do  echo $i; sleep 1; done;



