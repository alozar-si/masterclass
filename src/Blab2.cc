#include <TClonesArray.h>
#include <TH1F.h>
#include <TStopwatch.h>
#include <TDatime.h>
#include <TString.h>
#include <TFile.h>
#include <TTree.h>
#include <TBranch.h>
#include <TBufferJSON.h>
#include <TMath.h>
#include <vector>
#include "BParticle.h"
#include "BEvent.h"

class Hdr{
public:
  int id;
  int len;
  int progress;
};

std::vector<int> histogram(int n, ...){
std::vector<int> result;
int val = 0;
   va_list ap;
   int i;

   va_start(ap, n);
   for(i = 0; i < n; i++) {
      result.push_back(  va_arg(ap, int) );
   }
   va_end(ap);
return result;
}

class Blab2 {
public:
const char *names[12]={"photon", "electron", "pion", "muon", "kaon", "proton", "J/Psi", "D", "D*", "B", "Phi","Lambda0"};

UInt_t fNeve;
UInt_t fNfirst;
UInt_t fPrint;
TString fData;
TH1F *fH[100];
UInt_t fHtype[100];
TClonesArray *fList[100];

Blab2();
~Blab2();
void Init();
void event();
void Process();
void h1d(const char *varname, const char *name, int nbins, double min, double max, int id );
int  selector(int pin, int charge, SIMPLEPID particlename,  int hid, int pout );
int  selector(int pin, int charge, SIMPLEPID particlename,  std::vector<int> hid, int pout );
int  combiner(int id0 ,int id1 , int same, SIMPLEPID particlename, double min, double max, int hid, int id );
int  combiner(int id0 ,int id1 , int same, SIMPLEPID particlename, double min, double max, std::vector<int>hid, int id );
int  combiner3(int id0 ,int id1 , int id2, int same, SIMPLEPID particlename, double min, double max, int hid, int id );
int  combiner3(int id0 ,int id1 , int id2, int same, SIMPLEPID particlename, double min, double max, std::vector<int>hid, int id );
int  fix_mass(int id);
int  Fill(std::vector<int> hid, BParticle *p);
void plist(int i);


ClassDef ( Blab2, 1 )
};

ClassImp(Blab2)

Blab2::Blab2():fNfirst(0), fNeve(0), fData(), fPrint(0) { 

 Process(); 
};


void Blab2::h1d(const char *varname, const char *name, int nbins, double min, double max, int id ){
   TString svar(varname);
   TString axis[]={"mass (GeV/c2)",
		"momentum (GeV/c)",
		"energy (GeV)","charge",
		"identity",
		"momentum (GeV/c)",
		"momentum (GeV/c)",
		"momentum (GeV/c)",
		"momentum (GeV/c)",
		"angle (deg.)",
		"cos(theta)"};
   fHtype[id] = 0;
   if (svar.Contains("GetMass"    )) fHtype[id]=0;
   if (svar.Contains("GetMomentum")) fHtype[id]=1;
   if (svar.Contains("GetEnergy"  )) fHtype[id]=2;
   if (svar.Contains("GetCharge"  )) fHtype[id]=3;
   if (svar.Contains("GetPid"     )) fHtype[id]=4;
   if (svar.Contains("GetXMomentum")) fHtype[id]=5;
   if (svar.Contains("GetYMomentum")) fHtype[id]=6;
   if (svar.Contains("GetZMomentum")) fHtype[id]=7;
   if (svar.Contains("GetTransverseMomentum")) fHtype[id]=8;
   if (svar.Contains("GetTheta"))             fHtype[id]=9;
   if (svar.Contains("GetCosTheta"))          fHtype[id]=10;

   //fH[id]= new TH1F(TString::Format("h%d",id), TString::Format("%s;%s;N",name,axis[fHtype[id]].Data()), nbins, min, max);
   if (fHtype[id]==4) {
     fH[id]= new TH1F(TString::Format("h%d",id), TString::Format("%s;%s;N",name,axis[fHtype[id]].Data()), 11, 0, 11);
     for (int i=0;i<11;i++) fH[id]->GetXaxis()->SetBinLabel(i+1,names[i]);
   } else {
     fH[id]= new TH1F(TString::Format("h%d",id), TString::Format("%s;%s;N",name,axis[fHtype[id]].Data()), nbins, min, max);  
   }
   

}



int Blab2::Fill(std::vector<int> id, BParticle *p){
  for (int i=0; i< id.size(); i++){
 int hid = id[i];
  if (hid>=0 && fH[hid]) {
      double val;
      switch (fHtype[hid]){
      case 0 : val  = p->GetMass(); break;
      case 1 : val  = p->GetMomentum(); break;
      case 2 : val  = p->e(); break;
      case 3 : val  = p->charge(); break;
      case 4 : val  = p->pid(); break;
      case 5 : val  = p->px(); break;
      case 6 : val  = p->py(); break;
      case 7 : val  = p->pz(); break;
      case 8 : val  = p->GetTransverseMomentum(); break;
      case 9 : val  = (p->GetMomentum()!=0) ? p->pz()/p->GetMomentum() : 0; val = 180.0*TMath::ACos(val)/TMath::Pi(); break;
      case 10: val  = (p->GetMomentum()!=0) ? p->pz()/p->GetMomentum() : 0; break;
      default: val  = 0 ; break;
   }
   fH[hid]->Fill(val);
}  
    
   }

return 0;
}
int Blab2::combiner(int _p0, int _p1,int same, SIMPLEPID pid, double min, double max, int hid, int _p2 ){
std::vector<int> a;
return combiner(_p0,_p1,same,pid,min,max,a,_p2);
}

int Blab2::combiner3(int _p0, int _p1, int _p2, int same, SIMPLEPID pid, double min, double max, int hid, int _p3 ){
std::vector<int> a;
return combiner3(_p0,_p1,_p2, same,pid,min,max,a,_p3);
}

int Blab2::combiner(int _p0, int _p1,int same, SIMPLEPID pid, double min, double max, std::vector<int> hid, int _p2 ){
   // Loop over all the particles in both lists.
 if (_p0 < 0 ) _p0 =0;
 if (_p1 < 0 ) _p1 =0;
 

 fList[_p2]->Clear();
 int nprt=0;
 
 for(TIter next1(fList[_p0]);BParticle * p1 =(BParticle *) next1();) {
    // the second loop
   // in the case the second parti 
   for(TIter next2 = (_p0!=_p1 && same==0) ?  TIter(fList[_p1]): TIter(next1) ; BParticle * p2 =(BParticle *) next2();) {  
      if (p1==p2) continue;     // do not use the same particle in the combinations
      BParticle  p = *p1 + *p2; // Combine two particles into a new particle   
      if (p.InMassRange(min, max)){
            Fill(hid, &p);
 	    p.SetPid(pid); // set PID to particlename to fix the particle mass
            p.SetEnergyFromPid();
	    TClonesArray& list = *fList[_p2];           
	    new (list[nprt++]) BParticle ( p ); // create a new entry in kslist list of particles
           
      }	
        
   }
	  	
 }
 return _p2;
}


int Blab2::combiner3(int _p0, int _p1,int _p2, int same, SIMPLEPID pid, double min, double max, std::vector<int> hid, int _p3 ){
   // Loop over all the particles in both lists.
 if (_p0 < 0 ) _p0 =0;
 if (_p1 < 0 ) _p1 =0;
 if (_p2 < 0 ) _p2 =0;
 

 fList[_p3]->Clear();
 int nprt=0;
 
 for(TIter next1(fList[_p0]);BParticle * p1 =(BParticle *) next1();) {
    // the second loop
   // in the case the second parti 
   for(TIter next2 = (_p0!=_p1 && same==0) ?  TIter(fList[_p1]): TIter(next1) ; BParticle * p2 =(BParticle *) next2();) {  
      if (p1==p2) continue;     // do not use the same particle in the combinations
      for(TIter next3 = (_p1!=_p2 && same==0) ?  TIter(fList[_p2]): TIter(next2) ; BParticle * p3 =(BParticle *) next3();) {  
        if (p2==p3) continue;     // do not use the same particle in the combinations
        BParticle  p = *p1 + *p2 + *p3; // Combine two particles into a new particle   
        if (p.InMassRange(min, max)){
            Fill(hid, &p);
 	    p.SetPid(pid); // set PID to particlename to fix the particle mass
            p.SetEnergyFromPid();
	    TClonesArray& list = *fList[_p3];           
	    new (list[nprt++]) BParticle ( p ); // create a new entry in kslist list of particles       
        }
      }	
        
   }
	  	
 }
 return _p3;
}


int Blab2::selector(int pin, int charge, SIMPLEPID type ,  int  hid, int pout ){
std::vector<int> a;
return selector(pin,charge,type,a,pout);
}
int Blab2::selector(int pin, int charge, SIMPLEPID type ,  std::vector<int> hid, int pout ){
 if (pin < 0 ) pin =0;
 
  fList[pout]->Clear();
  int nprt=0;
  
  for(TIter next(fList[pin]); BParticle * p =(BParticle *) next();) {
	if (p->charge()== charge || charge > 1){
          if ( p->pid()== type || type == ALL ) {
	    TClonesArray& list = *fList[pout];
	    new (list[nprt++]) BParticle ( *p );
            Fill(hid, p);
          }
	}
  }	  
   return pout;
}


int Blab2::fix_mass(int pin){
   if (pin < 0 ) pin =0;
   for(TIter next(fList[pin]); BParticle * p =(BParticle *) next();)  p->SetEnergyFromPid();
   return pin;
}

void Blab2::plist(int i){
  fList[i]= new TClonesArray( "BParticle", 500 );
}
Blab2::~Blab2(){};


void send_message(int id, TString msg, int progress){
static Hdr hdr;

   hdr.id = id; 
   hdr.len= msg.Length();
   hdr.progress= progress;
   fwrite(&hdr,3*sizeof(int),1,stdout);
   fwrite(msg.Data(),hdr.len,1,stdout);
   fflush(stdout);

}


void Blab2::Process(){

char sList[0xFFFF];
for (int i=0;i<100;i++) fH[i]=NULL; 
for (int i=0;i<100;i++) fHtype[i]=0; 
for (int i=0;i<100;i++) fList[i]=NULL;

Init();

TFile * f = new TFile(TString::Format("../../data/%s",fData.Data())); // Open a data file
if(f->IsZombie()) {  send_message(0,TString::Format("File %s not found\n",fData.Data()), 0 );  return; }  
TTree * t =(TTree *) f-> Get( "T"); // Obtain a pointer to a tree of "event" data in the file
BEvent * mevent = new BEvent(); // Create a  "BEvent" object where data from the file will be loaded
TBranch * branch = t-> GetBranch( "BEvent"); // Obtain a branch for "BEvent" in the tree
branch-> SetAddress(&mevent); // Register created "BEvent" object to the branch
TH1F *fHnprt= new TH1F("h100", "Number of particles in the event;N particles;N events", 50, -0.5, 49.5);



send_message(0, TString::Format("<br>Number of Events in the file %lld<br>\n", t->GetEntries() ),0);
TStopwatch timer;
timer.Start(); 
int nev  = 0;
int i    =TMath::Min(fNfirst, (UInt_t) t-> GetEntries());
int cNeve=TMath::Min(fNfirst+fNeve, (UInt_t) t-> GetEntries());
int fPart = fPrint; 
int totaltracks = 0;
while (i<cNeve){
 t-> GetEntry(i); // Read the content of the event from the file
 fList[0]= mevent->GetParticleList();
 
 event();
 
 int progress = (100*i)/cNeve;
 if (i%10000==0) send_message(2, TString::Format("Event %d\n",i), progress);

 int nprt=0;
 if (nev>100) fPrint = 0; // disable particle prints for huge numer of events
 if (fPrint) sprintf(sList,"Primary particle list for Event %d<br/><table class='plist' ><tr><th>N<th>px(GeV/c)<th>py(GeV/c)<th>pz(GeV/c)<th>p(GeV/c)<th>Energy(GeV)<th>Charge<th>ID<th></tr>", i); 
 for(TIter next(fList[0]); BParticle * p =(BParticle *) next();) {
   nprt++;
   if (fPrint) sprintf(sList,"%s<tr><td>%d<td>%g<td>%g<td>%g<td>%g<td>%g<td>%1.0f<td>%s</tr>",sList,nprt, p->px(),p->py(),p->pz(),p->GetMomentum(),p->e(), p->charge(),names[p->pid()] );
 }
 if (fPart) fHnprt->Fill(nprt);
 totaltracks += nprt;
 if (fPrint) {
   sprintf(sList,"%s</table>",sList);
   send_message(0, TString(sList),progress);
   nev++;
 }
 mevent-> Clear();  // Clear the memory.
 for (int k=0;k<100;k++) if (fList[k]!=0) fList[k]->Clear();
 i++;
}
double avgtracks=(i)?float(totaltracks)/i:0;
send_message(0, TString::Format("Number of events processed: %d<br/>\nNumber of particles: %d<br/>\nAverage number of particles per event %f<br/>\n", i, totaltracks, avgtracks ),100);

if (fPart) send_message(1,TBufferJSON::ConvertToJSON(fHnprt),100 );


for (int i=0;i<100;i++) if (fH[i]!=0) send_message(1,TBufferJSON::ConvertToJSON(fH[i]),100 );

TDatime d;
timer.Stop(); 
send_message(3, TString::Format("'%s', %d, %f, %f", d.AsSQLString(),i, timer.RealTime(), timer.CpuTime() ),100);

}


