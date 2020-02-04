#include <stdlib.h>
#include <stdio.h>
#include <TH1F.h>
#include <TCanvas.h>
#include <TF1.h>
#include <TStyle.h>
#include <TBufferJSON.h>
#include <TString.h>
#include <TObjString.h>
#include <string.h>
//#include <TBufferXML.h>
class Hdr{
public:
  int id;
  int len;
  int progress;
};

void send_message(int id, TString msg, int progress){
static Hdr hdr;

   hdr.id = id; 
   hdr.len= msg.Length();
   hdr.progress= progress;
   fwrite(&hdr,3*sizeof(int),1,stdout);
   fwrite(msg.Data(),hdr.len,1,stdout);
   fflush(stdout);

}



int th1fit(Double_t *data, const char *name, const char *title, int xbins, double xmin, double xmax, double min=0, double max=1,const char *func=NULL, const char *pars=NULL){
 
TH1F *h = new TH1F(name,title,xbins, xmin,xmax);
for (int i=0;i<xbins+2;i++) h->SetBinContent(i,data[i]);
TF1 *f  = new TF1("f",func,min,max);

char *s = (char *)pars; 

int cntr=0;
char *p = strchr(s,',');
if (p!=NULL){ 
  do {
    char tok[0xFF];
    strncpy(tok, s, p-s);
    tok[p-s]=0;
    
    if (strlen(tok)) {
      //printf("*");
      f->SetParameter(cntr,atof(tok));
    }
    //printf("-----[%d] length=%d  %s\n", cntr, strlen(tok),tok);
    s = p + 1;
    cntr++;
    p = strchr(s,',');
  } while (p!=NULL);
}
if (strlen(s)>0) {
    f->SetParameter(cntr,atof(s));
    //printf("----[0x] %s\n",s);
} 


h->Fit(f,"RQ");

send_message(1,TBufferJSON::ConvertToJSON(h),0 );
return 0;
}
