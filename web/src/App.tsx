import { BrowserRouter, HashRouter, Route, RouterProvider, Routes, createHashRouter } from 'react-router-dom'
import HelmRelease from './pages/helm-release';
import Home from './pages/index';
import styles from "./index.css?inline"
import { SearchBar, SearchMode } from './components/search';
import { AppData as HRAppData, denormalize } from './generators/helm-release/models';
import GitHubButton from 'react-github-btn';
import { Top } from './pages/top';
import { Repo } from './pages/repo';
import Grep from './pages/grep';
import Image from './pages/image';
import { useEffect, useRef, useState } from 'react';
import HRSearchResults, { SearchInterface } from './components/search/hr';

export type AppData = HRAppData;


export default function App(props: AppData & { pageData: any }) {
  const { pageData, repoAlsoHas, } = props;
  const releases = denormalize(props).releases;
  const [search, setSearch2] = useState("");
  const childRef = useRef<SearchInterface>(null);
  
  const [mode, setMode] = useState<SearchMode|undefined>(undefined);
  if (!import.meta.env.SSR) {
    useEffect(() => {
      let handler: any;
      function checkHash() {
        let hash = window.location.hash;
        if(hash === "#/top") {
          window.location.href = "/top"
        } else if(hash.startsWith("#/repo:")) {
          window.location.href = "/repo/" + hash.slice("#/repo:".length)
        } else if(hash.startsWith("#/")) {
          hash = hash.slice(2);
          if(hash.startsWith("chart:")) {
            hash = hash.slice("chart:".length)
          }
          // decode
          hash = decodeURIComponent(hash);
          if(search !== hash){
            setSearch2(hash);
            return true;
          }
        } else if (hash.length > 1) {
          hash = hash.slice(1);
          hash = decodeURIComponent(hash);
          if(search !== hash) {
            setSearch2(hash);
            return true;
          }
        }
        return false;
      }
      if(!checkHash()){
        if(window.location.hash !== search){
          handler = setTimeout(() => {
            if(search) {
              history.replaceState(undefined, "", "#"+search);
            } else if(!search && window.location.hash) {
              history.replaceState(undefined, "", window.location.pathname + window.location.search);
            }
          }, 100);
        }
      }
      window.addEventListener("popstate", checkHash);
      return () => {
        if(handler) {
          clearTimeout(handler);
        }
        window.removeEventListener("popstate", checkHash);
      };
    }, []);
  }
  const setSearch = (s: string) => {
    if(s.length === 0) {
      history.replaceState(undefined, "", window.location.pathname + window.location.search);
    } else {
      history.replaceState(undefined, "", "#"+s)
    }
    setSearch2(s);
  };
  useEffect(() => {
    // on grep mode, redirect to /grep and keep location hash
    const isOnGrepPage = window.location.pathname === "/grep";
    const isOnImagePage = window.location.pathname === "/image";
    if(mode === "grep" && !isOnGrepPage) {
        // history.replaceState(undefined, "", "/grep" + window.location.hash);
        const s = search === "grep" ? "grep " : search;
        window.location.href = "/grep#" + encodeURI(s);
    }
    else if(mode === "image" && !isOnImagePage) {
      window.location.href = "/image#" + encodeURI(search);
    }
    // if not grep mode, but on grep page, redirect to / and keep location hash
    else if(isOnGrepPage) {
      if(mode && (mode !== "grep")) {
        window.location.href = "/" + encodeURI(window.location.hash);
      } else {
        setMode("grep");
      }
    } else if(isOnImagePage) {
      if(mode && (mode !== "image")) {
        window.location.href = "/" + encodeURI(window.location.hash);
      } else {
        setMode("image");
      }
    } else if(!mode) {
      setMode("hr");
    }
  }, [mode, search]);
  return (
    <div className='p-4'>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <nav>
      <div className="float-right m-4 w-32 h-7 place-content-end">
        <GitHubButton href="https://github.com/whazor/k8s-at-home-search" data-color-scheme="no-preference: light; light: light; dark: dark;" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star whazor/k8s-at-home on GitHub">Star</GitHubButton>
      </div>
        <a
        href={'/'} 
        ><h1 className="text-3xl dark:text-gray-300">kubesearch</h1></a>
        <p className="text-lg dark:text-gray-300">Search for a helm release</p>
      </nav>
      <div className='pt-2'>
        <div className='mb-4'>
          <SearchBar 
            search={search} 
            setSearch={setSearch} onEnter={() => childRef.current!.onEnter()}
            mode={mode} setMode={setMode}  
          />
          {mode === "hr" && <HRSearchResults releases={releases} search={search} ref={childRef} />}

        </div>
        <Routes>
          <Route key={"/"} path={"/"} element={<Home releases={releases} />} />
          {releases.map(({ key, chart, release }) => {
            return (
              <Route
                key={'hr-'+key}
                path={`/hr/${key}`}
                element={<HelmRelease {...{ chart, release }} 
                    key={'hr-el'+key}
                    url={'/hr/'+key}
                    pageData={pageData}
                    repoAlsoHas={repoAlsoHas}
                    releases={releases}
                    keyFileMap={props.keyFileMap}
                      />}
                ></Route>
            )
          })}
          <Route key="top" path="/top" element={<Top repos={pageData} repoAlsoHas={repoAlsoHas} />} />
          <Route key="grep" path="/grep" element={
            <Grep {...pageData} search={search} />
          } />
          <Route key="image" path="/image" element={<Image {...pageData} search={search} />} />
          {props.repos.map((repo) => {
            return (
              <Route
                key={'repo-'+repo}
                path={`/repo/${repo}`}
                element={<Repo {...pageData} />}
                ></Route>
            )
          })}
        </Routes>
      </div>
    </div>
  )
}